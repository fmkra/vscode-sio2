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
    apiUrl;
    constructor(context) {
        this.context = context;
        const setApiUrlDisposable = vscode.commands.registerCommand("sio2.setApiUrl", async () => {
            this.apiUrl = await vscode.window.showInputBox({
                title: "Provide API URL",
            });
            await this.context.globalState.update("sio2.apiUrl", this.apiUrl);
        });
        context.subscriptions.push(setApiUrlDisposable);
    }
    async getApiUrl() {
        if (this.apiUrl === undefined) {
            this.apiUrl = await this.context.globalState.get("sio2.apiUrl");
        }
        if (this.apiUrl === undefined) {
            this.apiUrl = await vscode.window.showInputBox({
                title: "Provide API URL",
            });
            await this.context.globalState.update("sio2.apiUrl", this.apiUrl);
        }
        return this.apiUrl;
    }
    async getContests() {
        const url = await this.getApiUrl();
        // await new Promise((r) => setTimeout(r, 5000));
        return [url + "contest 1", "contest 2"];
    }
    async getProblems(contestId) {
        const url = await this.getApiUrl();
        // await new Promise((r) => setTimeout(r, 5000));
        if (contestId === "contest 2")
            return [url + "prob 1", "prob 2", "prob 3"];
        else
            return ["prob a", url + "prob b"];
    }
}
exports.default = Api;
//# sourceMappingURL=Api.js.map