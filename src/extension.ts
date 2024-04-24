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
        async (context) => {
            let contestId = context?.contest?.contest?.id;
            let problemId = context?.problem?.short_name;

            if (!contestId) {
                contestId = await vscode.window.showInputBox({
                    title: "Provide contest id",
                });
            }
            if (!problemId) {
                problemId = await vscode.window.showInputBox({
                    title: "Provide problem id",
                });
            }

            if (!contestId || !problemId) {
                vscode.window.showErrorMessage(
                    "You must provide contest and problem id"
                );
                return;
            }
            await api.uploadProblemSolution(contestId, problemId);
        }
    );
    context.subscriptions.push(uploadProblemSolution);
}

export function deactivate() {}
