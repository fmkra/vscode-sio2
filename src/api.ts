import * as vscode from "vscode";

export default class Api {
    apiUrl?: string;

    constructor(private context: vscode.ExtensionContext) {
        const setApiUrlDisposable = vscode.commands.registerCommand(
            "sio2.setApiUrl",
            async () => {
                this.apiUrl = await vscode.window.showInputBox({
                    title: "Provide API URL",
                });
                await this.context.globalState.update(
                    "sio2.apiUrl",
                    this.apiUrl
                );
            }
        );
        context.subscriptions.push(setApiUrlDisposable);
    }

    private async getApiUrl() {
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

    async getProblems(contestId: string) {
        const url = await this.getApiUrl();
        // await new Promise((r) => setTimeout(r, 5000));
        if (contestId === "contest 2")
            return [url + "prob 1", "prob 2", "prob 3"];
        else return ["prob a", url + "prob b"];
    }
}
