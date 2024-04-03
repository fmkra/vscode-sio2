"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const ProblemsView_1 = require("./ProblemsView");
const Api_1 = __importDefault(require("./Api"));
const jszip_1 = __importDefault(require("jszip"));
function activate(context) {
    const apiUrlDidChangeEventEmitter = new vscode.EventEmitter();
    const api = new Api_1.default(context, apiUrlDidChangeEventEmitter);
    new ProblemsView_1.ProblemsView(context, api, apiUrlDidChangeEventEmitter.event);
    // let disposable = vscode.commands.registerCommand(
    //     "sio2.openProblemContent",
    //     async (cx) => {
    //         await context.globalState.update("sio2.apiUrl", undefined);
    //         // const contestId = cx.contest.contestId;
    //         // const problemId = cx.problemId;
    //         // vscode.window.showQuickPick(["option1", "option 2"]);
    //         const x = await vscode.window.showInputBox({});
    //         vscode.window.showInformationMessage(
    //             x ?? "nothing"
    //             // `Opening problem ${contestId} ${problemId}`
    //         );
    //     }
    // );
    // context.subscriptions.push(disposable);
    let d = vscode.commands.registerCommand("sio2.openProblemContent", async () => {
        const panel = vscode.window.createWebviewPanel("pdfView", // Identifies the type of the webview. Used internally
        "PDF View", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
            // Enable scripts in the webview
            enableScripts: true,
        });
        // Specify the URL of the PDF here
        const pdfUrl = "https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20040540535/U/D20040535Lj.pdf";
        async function getFileData() {
            // vscode.window.showInformationMessage("starting fetching");
            // const fileDownloader = await FileDownloaderApi.getApi();
            // const file = await fileDownloader.downloadFile(
            //     vscode.Uri.parse(pdfUrl),
            //     "testfile.pdf",
            //     context
            // );
            // vscode.window.showInformationMessage(file.toString());
            const res = await fetch(pdfUrl);
            const fileData = new Uint8Array(await res.arrayBuffer());
            // let headers = "";
            // for (const h of res.headers.entries()) {
            //     headers += `${h[0]}: ${h[1]}; `;
            // }
            // return (
            //     headers +
            //     fileData.map((x) => (x as any).toString(16)).join(" ")
            // );
            // const fileData = await vscode.workspace.fs.readFile(
            //     // file
            //     vscode.Uri.joinPath(context.extensionUri, "mro.pdf")
            // );
            // return fileData.map((x) => (x as any).toString(16)).join(" ");
            return await PdfFileDataProvider.fromUint8Array(fileData).getFileData();
        }
        // Use an iframe to display the PDF from a URL
        getWebviewContent(getFileData, panel, context.extensionUri);
    });
    context.subscriptions.push(d);
}
exports.activate = activate;
class DataTypeEnum {
    static BASE64STRING = "base64";
    static UINT8ARRAY = "u8array";
}
class PdfFileDataProvider {
    static DataTypeEnum = DataTypeEnum;
    type;
    data;
    name;
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.name = "PDF Preview (via API)";
    }
    static fromBase64String(base64Data) {
        return new PdfFileDataProvider(DataTypeEnum.BASE64STRING, base64Data);
    }
    static fromUint8Array(u8array) {
        return new PdfFileDataProvider(DataTypeEnum.UINT8ARRAY, u8array);
    }
    withName(newName) {
        this.name = newName;
        return this;
    }
    getFileData() {
        var _data = this.data;
        var _type = this.type;
        return new Promise(function (resolve, reject) {
            if (typeof _data === "undefined") {
                reject(new TypeError("Cannot get file data because data is undefined."));
            }
            switch (_type) {
                case DataTypeEnum.BASE64STRING:
                    resolve(_data);
                    break;
                case DataTypeEnum.UINT8ARRAY:
                    var z = new jszip_1.default();
                    z.file("filename.pdf", _data);
                    z.files["filename.pdf"].async("base64").then(function (f) {
                        resolve(f);
                    }, function (err) {
                        reject(err);
                        console.error("HINT from PDF Viewer API: There was an error converting the pdf file data from a Uint8Array to a base64 string using JSZip.");
                    });
                    break;
                default:
                    reject(new TypeError("Unknown data type " + _type));
                    break;
            }
        });
    }
}
function getWebviewContent(getFileData, panel, extUri) {
    panel.webview.options = {
        enableScripts: true,
    };
    panel.webview.html = `<!DOCTYPE html>
    <html>
    
    <head>
      <script defer src="${panel.webview.asWebviewUri(vscode.Uri.joinPath(extUri, "media", "pdf.min.js"))}"></script>
      <script defer src="${panel.webview.asWebviewUri(vscode.Uri.joinPath(extUri, "media", "editor.js"))}"></script>
      <link rel="stylesheet" href="${panel.webview.asWebviewUri(vscode.Uri.joinPath(extUri, "media", "editor.css"))}">
    </head>
    
    <body>
    
      <div id="loading">
        <h1>Your PDF is loading...</h1>
        <p>If you see this screen for more than a few seconds, close this editor tab and reopen the file.</p>
      </div>
      <div id="canvas"></div>
    
    </body>
    
    </html>`;
    getFileData().then(function (data) {
        panel.webview.postMessage({
            command: "base64",
            data: data,
            workerUri: panel.webview
                .asWebviewUri(vscode.Uri.joinPath(extUri, "media", "pdf.worker.min.js"))
                .toString(true),
        });
    });
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map