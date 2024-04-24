import * as vscode from "vscode";
import * as dto from "./dto";

interface StoredUrl {
    name: string;
    url: string;
    token?: string;
}

interface ApiData {
    url: string;
    token?: string;
}

export default class Api {
    apiData?: ApiData;

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
                await this.context.globalState.update(
                    "sio2.apiData",
                    undefined
                );
                this.apiData = undefined;
                this.onApiUrlUpdate.fire();
            }
        );
        context.subscriptions.push(resetApiUrls);
    }

    getExtensionUri() {
        return this.context.extensionUri;
    }

    async updateApiUrl() {
        const _savedUrls = await this.context.globalState.get(
            "sio2.apiSavedUrls"
        );
        let savedUrls: StoredUrl[];
        if (_savedUrls === undefined || typeof _savedUrls !== "string") {
            savedUrls = [
                { name: "mimuw", url: "https://sio2.mimuw.edu.pl" },
                { name: "szkopul", url: "https://szkopul.edu.pl" },
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
        return new Promise<ApiData>((resolve, reject) => {
            const qp = vscode.window.createQuickPick();
            qp.title = "Select which SIO2 API URL you want to use";
            const addItem = {
                label: "Add new URL to the list",
            };
            const qpItems: vscode.QuickPickItem[] = [
                ...savedUrls.map((url) => ({
                    label: url.name,
                    detail: url.url,
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
                    const token = await vscode.window.showInputBox({
                        title: "Enter your API token",
                        placeHolder: "Token",
                    });
                    await this.context.globalState.update(
                        "sio2.apiSavedUrls",
                        JSON.stringify([{ name, url, token }, ...savedUrls])
                    );
                    await this.updateApiUrl();
                } else {
                    const selectedItem = qp.selectedItems[0];
                    const itemIndex = qpItems.indexOf(selectedItem);
                    this.apiData = savedUrls[itemIndex];
                    if (this.apiData.token === undefined) {
                        const token = await vscode.window.showInputBox({
                            title: "Enter your API token",
                            placeHolder: "Token",
                        });
                        this.apiData.token = token;
                    }
                    await this.context.globalState.update(
                        "sio2.apiData",
                        JSON.stringify(this.apiData)
                    );

                    this.onApiUrlUpdate.fire();

                    qp.dispose();
                    resolve(this.apiData);
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

    private async getApi() {
        if (this.apiData === undefined) {
            const apiData = (await this.context.globalState.get(
                "sio2.apiData"
            )) as string | undefined;
            this.apiData =
                apiData === undefined ? undefined : JSON.parse(apiData);
        }
        if (this.apiData === undefined) {
            await this.updateApiUrl();
        }
        return this.apiData;
    }

    async getContests() {
        const api = await this.getApi();
        if (api === undefined) {
            return [];
            // TODO: show some message that you have to select an API
        }
        const { url, token } = api;
        vscode.window.showInformationMessage(`${url} ${token}`);
        if (token === undefined || token === "") {
            throw new Error(`No token provided for ${url}`);
        }
        const res = await fetch(`${url}/api/contest_list`, {
            headers: {
                Accept: "application/json",
                Authorization: `Token ${token}`,
            },
        });
        if (res.status !== 200) {
            throw new Error(`Failed to fetch contests: ${res.statusText}`);
        }
        return (await res.json()) as dto.Contest[];
    }

    async getProblems(contestId: string) {
        const api = await this.getApi();
        if (api === undefined) {
            return [];
            // TODO: show some message that you have to select an API
        }
        const res = await fetch(`${api.url}/api/c/${contestId}/problem_list/`, {
            headers: {
                Accept: "application/json",
                Authorization: `Token ${api.token}`,
            },
        });
        if (res.status !== 200) {
            throw new Error(`Failed to fetch problems: ${res.statusText}`);
        }
        return (await res.json()) as dto.Problem[];
    }

    async getProblemUrl(contestId: string, problemId: string) {
        const api = await this.getApi();
        if (api === undefined) {
            throw new Error("select api"); // TODO: change error message
        }
        return `${api.url}/c/${contestId}/p/${problemId}`;
    }

    async uploadProblemSolution(contestId: string, problemId: string) {
        const api = await this.getApi();
        if (api === undefined) {
            throw new Error("select api"); // TODO: change error message
        }
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const text = editor.document.getText();
            const filename = editor.document.fileName.split("/").at(-1)!;
            if (filename.indexOf(".") === -1) {
                vscode.window.showErrorMessage(
                    "Uploading problem solution failed.\nFile must have an extension."
                );
                return;
            }

            if (
                !(await vscode.window.showInformationMessage(
                    `Do you want to submit ${filename} as your solution to ${problemId}?`,
                    { modal: true },
                    { title: "Submit" }
                ))
            ) {
                return;
            }

            let formData = new FormData();
            formData.append("file", new Blob([text]), filename);

            let payload = {
                method: "POST",
                headers: {
                    Authorization: `Token ${api.token}`,
                },
                body: formData,
            };

            const res = await fetch(
                `${api.url}/api/c/${contestId}/submit/${problemId}`,
                payload
            );
            if (res.status !== 200) {
                vscode.window.showErrorMessage(
                    `Uploading problem solution failed.\n${await res.text()}`
                );
                return;
            }
            const submitId = await res.text();
            vscode.window.showInformationMessage(
                `Problem solution uploaded successfully.\nSubmit ID: ${submitId}`
            );
        }
    }
}
