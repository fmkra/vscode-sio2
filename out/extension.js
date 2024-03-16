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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const ProblemsView_1 = require("./ProblemsView");
const Api_1 = __importDefault(require("./Api"));
function activate(context) {
    const apiUrlDidChangeEventEmitter = new vscode.EventEmitter();
    const api = new Api_1.default(context, apiUrlDidChangeEventEmitter);
    new ProblemsView_1.ProblemsView(context, api, apiUrlDidChangeEventEmitter.event);
    let disposable = vscode.commands.registerCommand("sio2.openProblemContent", async (cx) => {
        await context.globalState.update("sio2.apiUrl", undefined);
        // const contestId = cx.contest.contestId;
        // const problemId = cx.problemId;
        // vscode.window.showQuickPick(["option1", "option 2"]);
        const x = await vscode.window.showInputBox({});
        vscode.window.showInformationMessage(x ?? "nothing"
        // `Opening problem ${contestId} ${problemId}`
        );
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map