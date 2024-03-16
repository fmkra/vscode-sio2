import * as vscode from "vscode";
import { ProblemsView } from "./ProblemsView";
import Api from "./Api";

export function activate(context: vscode.ExtensionContext) {
    const api = new Api(context);
    new ProblemsView(context, api);

    let disposable = vscode.commands.registerCommand(
        "sio2.openProblemContent",
        async (context) => {
            const contestId = context.contest.contestId;
            const problemId = context.problemId;
            // vscode.window.showQuickPick(["option1", "option 2"]);
            const x = await vscode.window.showInputBox({});
            vscode.window.showInformationMessage(
                x ?? "nothing"
                // `Opening problem ${contestId} ${problemId}`
            );
        }
    );
    context.subscriptions.push(disposable);
}

export function deactivate() {}
