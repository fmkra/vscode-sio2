import * as vscode from "vscode";
import { ProblemsView } from "./ProblemsView";
import Api from "./api";
import PdfViewer from "./pdfViewer";

export function activate(context: vscode.ExtensionContext) {
    const apiUrlDidChangeEventEmitter = new vscode.EventEmitter<void>();

    const api = new Api(context, apiUrlDidChangeEventEmitter);
    new ProblemsView(context, api, apiUrlDidChangeEventEmitter.event);
    new PdfViewer(context, api);

    const uploadProblemSolution = vscode.commands.registerCommand(
        "sio2.uploadProblemSolution",
        api.uploadProblemSolution
    );
    context.subscriptions.push(uploadProblemSolution);
}

export function deactivate() {}
