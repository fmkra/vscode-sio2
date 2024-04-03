"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
class Api {
    context;
    onApiUrlUpdate;
    apiUrl;
    constructor(context, onApiUrlUpdate) {
        this.context = context;
        this.onApiUrlUpdate = onApiUrlUpdate;
        const setApiUrlDisposable = vscode.commands.registerCommand("sio2.setApiUrl", () => {
            this.updateApiUrl();
        }, this);
        context.subscriptions.push(setApiUrlDisposable);
        const resetApiUrls = vscode.commands.registerCommand("sio2.resetApiUrls", async () => {
            await this.context.globalState.update("sio2.apiSavedUrls", undefined);
            await this.context.globalState.update("sio2.apiUrl", undefined);
            this.apiUrl = undefined;
            this.onApiUrlUpdate.fire();
        });
        context.subscriptions.push(resetApiUrls);
    }
    async updateApiUrl() {
        const _savedUrls = await this.context.globalState.get("sio2.apiSavedUrls");
        let savedUrls;
        if (_savedUrls === undefined || typeof _savedUrls !== "string") {
            savedUrls = [
                ["mimuw", "https://sio2.mimuw.edu.pl"],
                ["szkopul", "https://szkopul.edu.pl"],
            ];
            await this.context.globalState.update("sio2.apiSavedUrls", JSON.stringify(savedUrls));
        }
        else {
            savedUrls = JSON.parse(_savedUrls);
        }
        const buttons = [
            {
                iconPath: vscode.Uri.joinPath(this.context.extensionUri, "assets", "bin.svg"),
            },
        ];
        return new Promise((resolve, reject) => {
            const qp = vscode.window.createQuickPick();
            qp.title = "Select which SIO2 API URL you want to use";
            const addItem = {
                label: "Add new URL to the list",
            };
            const qpItems = [
                ...savedUrls.map((url) => ({
                    label: url[0],
                    detail: url[1],
                    buttons,
                })),
                {
                    label: "",
                    kind: vscode.QuickPickItemKind.Separator,
                },
                addItem,
            ];
            qp.items = qpItems;
            qp.onDidAccept(async () => {
                if (qp.selectedItems[0] === addItem) {
                    const name = await vscode.window.showInputBox({
                        title: "Name your API URL",
                        placeHolder: "Name",
                    });
                    const url = await vscode.window.showInputBox({
                        title: "Enter a valid API URL",
                        value: "https://",
                        valueSelection: [-1, -1],
                    });
                    await this.context.globalState.update("sio2.apiSavedUrls", JSON.stringify([[name, url], ...savedUrls]));
                    await this.updateApiUrl();
                }
                else {
                    const url = qp.selectedItems[0].detail;
                    this.apiUrl = url;
                    await this.context.globalState.update("sio2.apiUrl", url);
                    this.onApiUrlUpdate.fire();
                    qp.dispose();
                    resolve(url);
                }
            });
            qp.onDidHide(() => {
                reject(); // TODO: handle rejected promise in ProblemsView
            });
            qp.onDidTriggerItemButton(async (b) => {
                const index = qp.items.findIndex((v) => v === b.item);
                await this.context.globalState.update("sio2.apiSavedUrls", JSON.stringify(savedUrls.filter((_, i) => i !== index)));
                qp.items = qp.items.filter((_, i) => i !== index);
            });
            qp.show();
        });
    }
    async getApiUrl() {
        if (this.apiUrl === undefined) {
            this.apiUrl = await this.context.globalState.get("sio2.apiUrl");
        }
        if (this.apiUrl === undefined) {
            await this.updateApiUrl();
        }
        return this.apiUrl;
    }
    token = `c218b616558cd6f14aa78f1885da00449a4c60a8`;
    async getContests() {
        const url = await this.getApiUrl();
        const res = await fetch(`${url}/api/contest_list`, {
            headers: {
                Accept: "application/json",
                Authorization: `Token ${this.token}`,
            },
        });
        const contests = await res.json();
        return contests.map((contest) => contest.id);
    }
    async getProblems(contestId) {
        const url = await this.getApiUrl();
        if (contestId === "contest 2") {
            return [url + "prob 1", "prob 2", "prob 3"];
        }
        else {
            return ["prob a", url + "prob b"];
        }
    }
}
exports.default = Api;
//# sourceMappingURL=Api.js.map