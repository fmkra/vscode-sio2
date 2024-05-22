import * as vscode from "vscode";
import { ProblemsView } from "./ProblemsView";
import Api from "./api";
import PdfViewer from "./pdfViewer";

export function activate(context: vscode.ExtensionContext) {
    const dataDidChangeEventEmitter = new vscode.EventEmitter<void>();

    const api = new Api(context, dataDidChangeEventEmitter);
    new ProblemsView(
        context,
        api,
        dataDidChangeEventEmitter.event,
        context.extensionUri
    );
    new PdfViewer(context, api);

    const refreshContests = vscode.commands.registerCommand(
        "sio2.refreshContests",
        () => {
            dataDidChangeEventEmitter.fire();
        }
    );
    context.subscriptions.push(refreshContests);

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
