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
exports.ApiCommands = void 0;
const vscode = __importStar(require("vscode"));
class ApiCommands {
    context;
    apiUrl;
    constructor(context) {
        this.context = context;
        // const setApiUrlDisposable = vscode.commands.registerCommand(
        //     "sio2.setApiUrl",
        //     async (context) => {
        //         const x = await vscode.window.showInputBox({});
        //         vscode.window.showInformationMessage(
        //             x ?? "nothing"
        //             // `Opening problem ${contestId} ${problemId}`
        //         );
        //     }
        // );
        // context.subscriptions.push(setApiUrlDisposable);
    }
    async getApiUrl() {
        if (this.apiUrl === undefined) {
            this.apiUrl = await this.context.globalState.get("sio2.apiUrl");
        }
        if (this.apiUrl === undefined) {
            this.apiUrl = await vscode.window.showInputBox({
                title: "Provide API URL",
            });
        }
        return this.apiUrl;
    }
    async getContests() {
        // await new Promise((r) => setTimeout(r, 5000));
        return ["contest 1", "contest 2"];
    }
    async getProblems(contestId) {
        // await new Promise((r) => setTimeout(r, 5000));
        if (contestId === "contest 1")
            return ["prob 1", "prob 2", "prob 3"];
        else
            return ["prob a", "prob b"];
    }
}
exports.ApiCommands = ApiCommands;
//# sourceMappingURL=ApiCommands.js.map