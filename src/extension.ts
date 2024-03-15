import * as vscode from "vscode";
import { ContestItem, ProblemsView } from "./ProblemsView";

export function activate(context: vscode.ExtensionContext) {
    new ProblemsView(context);

    let disposable = vscode.commands.registerCommand(
        "sio2.openProblemContent",
        async (context) => {
            const contestId = context.contest.contestId;
            const problemId = context.problemId;
            vscode.window.showInformationMessage(
                `Opening problem ${contestId} ${problemId}`
            );
        }
    );
    context.subscriptions.push(disposable);
}

export function deactivate() {}
