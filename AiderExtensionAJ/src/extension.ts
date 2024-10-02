import * as vscode from "vscode";

let terminal: vscode.Terminal | undefined;
let webviewView: vscode.WebviewView | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("Activating AI Coding Assistant Extension");

  const provider = new AICodingAssistantViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "aiCodingAssistantSidebar",
      provider,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ai-coding-assistant.openSidebar", () => {
      vscode.commands.executeCommand(
        "workbench.view.extension.ai-coding-assistant",
      );
    }),
  );

  // Instead of using onDidWriteTerminalData, we'll use onDidChangeActiveTerminal
  // and set up a listener for the terminal's onDidWriteData event
  //   context.subscriptions.push(
  //     vscode.window.onDidChangeActiveTerminal((activeTerminal) => {
  //       if (activeTerminal && activeTerminal === terminal) {
  //         const listener = activeTerminal.onDidWriteData((data: string) => {
  //           const lines = data.split("\n");
  //           lines.forEach((line) => {
  //             webviewView?.webview.postMessage({
  //               type: "terminalOutput",
  //               data: line + "\n",
  //             });
  //           });
  //         });
  //         context.subscriptions.push(listener);
  //       }
  //     }),
  //   );
  // }

  // Use a polling mechanism to check for new terminal content
  let lastContent = "";
  const pollTerminal = () => {
    if (terminal && webviewView) {
      vscode.commands.executeCommand("workbench.action.terminal.selectAll");
      vscode.commands.executeCommand("workbench.action.terminal.copySelection");
      vscode.env.clipboard.readText().then((text) => {
        if (text !== lastContent) {
          const newContent = text.slice(lastContent.length);
          webviewView?.webview.postMessage({
            type: "terminalOutput",
            data: newContent,
          });
          lastContent = text;
        }
      });
    }
    setTimeout(pollTerminal, 1000); // Poll every second
  };

  pollTerminal();
}

class AICodingAssistantViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case "runAider":
          this.runAiderCommand(message.command);
          break;
        case "getSettings":
          this.sendSettings(webviewView);
          break;
      }
    });

    webviewView = webviewView;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "webview", "webview.js"),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "webview", "webview.css"),
    );

    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>AI Coding Assistant</title>
            </head>
            <body>
                <div id="root"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>
        `;
  }

  private getOrCreateTerminal(): vscode.Terminal {
    if (!terminal || terminal.exitStatus !== undefined) {
      terminal = vscode.window.createTerminal("Aider");
    }
    return terminal;
  }

  private runAiderCommand(command: string) {
    const terminal = this.getOrCreateTerminal();
    terminal.sendText(command);
    terminal.show();
  }

  private sendSettings(webviewView: vscode.WebviewView) {
    const config = vscode.workspace.getConfiguration("aiCodingAssistant");
    webviewView.webview.postMessage({
      type: "settings",
      settings: {
        provider: config.get("provider"),
        model: config.get("model"),
      },
    });
  }
}

export function deactivate() {}
