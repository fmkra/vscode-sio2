import * as vscode from "vscode";
import { ProblemsView } from "./ProblemsView";

export function activate(context: vscode.ExtensionContext) {
    new ProblemsView(context);
}

export function deactivate() {}
