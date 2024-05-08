import * as vscode from "vscode";
import Api from "./api";
import * as dto from "./dto";

class TodoDecorationProvider implements vscode.FileDecorationProvider {
    provideFileDecoration(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FileDecoration> {
        // https://code.visualstudio.com/api/references/theme-color#lists-and-trees
        if (uri.scheme === "foo") {
            console.log("URII", uri);
            const points = new URLSearchParams(uri.query).get("points");
            return {
                color: new vscode.ThemeColor(
                    points === "100"
                        ? "terminal.ansiBrightGreen"
                        : points === "0"
                        ? "terminal.ansiRed"
                        : "terminal.ansiYellow"
                ),
            };
        }

        return undefined;
    }
}
vscode.window.registerFileDecorationProvider(new TodoDecorationProvider());

export interface TreeDataSubProvider<T> {
    getTreeItem(element: T): vscode.TreeItem | Thenable<vscode.TreeItem>;
    getChildren(element?: T): vscode.ProviderResult<T[]>;
    getParent?(element: T): vscode.ProviderResult<T>;
}
// TODO: think of a name
export class SubmitItem implements TreeDataSubProvider<TreeItem> {
    constructor(
        readonly problem: ProblemItem,
        readonly submit: [string, string],
        readonly extensionUri: vscode.Uri
    ) {}

    getChildren() {
        return [];
    }

    getParent() {
        return this.problem;
    }

    getTreeItem() {
        return {
            label: {
                label: this.submit[0],
            },
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "submit",
            resourceUri: vscode.Uri.parse("foo://bar?points=" + this.submit[1]),
            iconPath: vscode.Uri.joinPath(
                this.extensionUri,
                "assets",
                "points",
                this.submit[1] + ".svg"
            ),
        };
    }
}

export class ProblemItem implements TreeDataSubProvider<TreeItem> {
    constructor(
        readonly contest: ContestItem,
        readonly problem: dto.Problem,
        readonly extensionUri: vscode.Uri
    ) {}

    getChildren() {
        const submitList = [
            ["Zadanie 1", "100"],
            ["Zadanie 2", "63"],
            ["Zadanie 3", "0"],
        ] as [string, string][]; //await this.api.getProblems(this.contest.id);
        return submitList.map(
            (submit) => new SubmitItem(this, submit, this.extensionUri)
        );
    }

    getParent() {
        return this.contest;
    }

    getTreeItem() {
        return {
            label: {
                label: this.problem.full_name,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "problem",
        };
    }
}

export class ContestItem implements TreeDataSubProvider<TreeItem> {
    constructor(
        private api: Api,
        readonly contest: dto.Contest,
        readonly extensionUri: vscode.Uri
    ) {}

    async getChildren() {
        const problemList = await this.api.getProblems(this.contest.id);
        return problemList.map(
            (problem) => new ProblemItem(this, problem, this.extensionUri)
        );
    }

    getParent() {
        return undefined;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: {
                label: this.contest.name,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }
}

export class ErrorItem {
    constructor(private detail: string) {}

    getChildren() {
        return [];
    }

    getParent() {
        return undefined;
    }

    getTreeItem() {
        return {
            label: {
                label: this.detail,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.None,
        };
    }
}

type TreeItem = SubmitItem | ProblemItem | ContestItem | ErrorItem;

export class ProblemsView {
    constructor(
        context: vscode.ExtensionContext,
        private api: Api,
        private dataChangedEvent: vscode.Event<void>,
        private extensionUri: vscode.Uri
    ) {
        const view = vscode.window.createTreeView("sio2-problems", {
            treeDataProvider: this.treeDataProvider(),
            showCollapseAll: true,
        });
        context.subscriptions.push(view);
    }

    treeDataProvider(): vscode.TreeDataProvider<TreeItem> {
        const getContests = async () => {
            try {
                const contests = await this.api.getContests();
                return contests.map(
                    (contest) =>
                        new ContestItem(this.api, contest, this.extensionUri)
                );
            } catch (e) {
                return [new ErrorItem(e?.toString() ?? "Unknown error")];
            }
        };
        return {
            getChildren: (element) =>
                element ? element.getChildren() : getContests(),
            getParent: (element) => element.getParent(),
            getTreeItem: (element) => element.getTreeItem(),
            onDidChangeTreeData: this.dataChangedEvent,
        };
    }
}
