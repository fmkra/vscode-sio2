import * as vscode from "vscode";
import { ProblemsView } from "./ProblemsView";
import Api from "./api";
import PdfViewer from "./pdfViewer";

export function activate(context: vscode.ExtensionContext) {
    const apiUrlDidChangeEventEmitter = new vscode.EventEmitter<void>();

    const api = new Api(context, apiUrlDidChangeEventEmitter);
    new ProblemsView(context, api, apiUrlDidChangeEventEmitter.event);
    new PdfViewer(context, api);
}

export function deactivate() {}
