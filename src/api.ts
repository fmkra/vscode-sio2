import * as vscode from "vscode";

export default class Api {
    apiUrl?: string;

    constructor(
        private context: vscode.ExtensionContext,
        private onApiUrlUpdate: vscode.EventEmitter<void>
    ) {
        const setApiUrlDisposable = vscode.commands.registerCommand(
            "sio2.setApiUrl",
            () => {
                this.updateApiUrl();
            },
            this
        );
        context.subscriptions.push(setApiUrlDisposable);

        const resetApiUrls = vscode.commands.registerCommand(
            "sio2.resetApiUrls",
            async () => {
                await this.context.globalState.update(
                    "sio2.apiSavedUrls",
                    undefined
                );
                await this.context.globalState.update("sio2.apiUrl", undefined);
                this.apiUrl = undefined;
                this.onApiUrlUpdate.fire();
            }
        );
        context.subscriptions.push(resetApiUrls);
    }

    async updateApiUrl() {
        const _savedUrls = await this.context.globalState.get(
            "sio2.apiSavedUrls"
        );
        let savedUrls: [string, string][];
        if (_savedUrls === undefined || typeof _savedUrls !== "string") {
            savedUrls = [
                ["mimuw", "https://sio2.mimuw.edu.pl"],
                ["szkopul", "https://szkopul.edu.pl"],
            ];
            await this.context.globalState.update(
                "sio2.apiSavedUrls",
                JSON.stringify(savedUrls)
            );
        } else {
            savedUrls = JSON.parse(_savedUrls);
        }
        const buttons = [
            {
                iconPath: vscode.Uri.joinPath(
                    this.context.extensionUri,
                    "assets",
                    "bin.svg"
                ),
            },
        ];
        return new Promise<string>((resolve, reject) => {
            const qp = vscode.window.createQuickPick();
            qp.title = "Select which SIO2 API URL you want to use";
            const addItem = {
                label: "Add new URL to the list",
            };
            const qpItems: vscode.QuickPickItem[] = [
                ...savedUrls.map((url) => ({
                    label: url[0],
                    detail: url[1],
                    buttons,
                })),
                {
                    label: "",
                    kind: vscode.QuickPickItemKind.Separator,
                },
                addItem,
            ];
            qp.items = qpItems;

            qp.onDidAccept(async () => {
                if (qp.selectedItems[0] === addItem) {
                    const name = await vscode.window.showInputBox({
                        title: "Name your API URL",
                        placeHolder: "Name",
                    });
                    const url = await vscode.window.showInputBox({
                        title: "Enter a valid API URL",
                        value: "https://",
                        valueSelection: [-1, -1],
                    });
                    await this.context.globalState.update(
                        "sio2.apiSavedUrls",
                        JSON.stringify([[name, url], ...savedUrls])
                    );
                    await this.updateApiUrl();
                } else {
                    const url = qp.selectedItems[0].label;

                    this.apiUrl = url;
                    await this.context.globalState.update("sio2.apiUrl", url);

                    this.onApiUrlUpdate.fire();

                    qp.dispose();
                    resolve(url);
                }
            });
            qp.onDidHide(() => {
                reject(); // TODO: handle rejected promise in ProblemsView
            });
            qp.onDidTriggerItemButton(async (b) => {
                const index = qp.items.findIndex((v) => v === b.item);

                await this.context.globalState.update(
                    "sio2.apiSavedUrls",
                    JSON.stringify(savedUrls.filter((_, i) => i !== index))
                );
                qp.items = qp.items.filter((_, i) => i !== index);
            });
            qp.show();
        });
    }

    private async getApiUrl() {
        if (this.apiUrl === undefined) {
            this.apiUrl = await this.context.globalState.get("sio2.apiUrl");
        }
        if (this.apiUrl === undefined) {
            await this.updateApiUrl();
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
