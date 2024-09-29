import * as vscode from 'vscode';
import { getNonce } from './utils/security';
import { AiderIntegration } from './AiderIntegration';

export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _aiderIntegration: AiderIntegration
    ) {
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        const html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.html = html;

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "runAider": {
                    const result = await this._aiderIntegration.runAiderCommand(data.prompt, data.mode);
                    this._view?.webview.postMessage({ type: "aiderResult", result });
                    break;
                }
                case "getTheme": {
                    const theme = this._getCurrentTheme();
                    this._view?.webview.postMessage({ type: "theme", theme });
                    break;
                }
                case "getSettings": {
                    const settings = this._getSettings();
                    this._view?.webview.postMessage({ type: "settings", settings });
                    break;
                }
                case "updateSettings": {
                    await this._updateSettings(data.settings);
                    break;
                }
            }
        });

    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "webview.js"));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "webview.css"));
    
        const nonce = getNonce();
    
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                <link href="${styleUri}" rel="stylesheet">
                <title>AI Coding Assistant</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    private _getCurrentTheme(): any {
        const foreground = new vscode.ThemeColor('foreground');
        const background = new vscode.ThemeColor('editor.background');
        return {
            kind: vscode.window.activeColorTheme.kind,
            foreground: foreground.toString(),
            background: background.toString(),
        };
    }

    private _getSettings(): any {
        const config = vscode.workspace.getConfiguration('aiCodingAssistant');
        return {
            provider: config.get<string>('provider', 'openai'),
            model: config.get<string>('model', 'gpt-3.5-turbo'),
        };
    }

    private async _updateSettings(settings: any): Promise<void> {
        const config = vscode.workspace.getConfiguration('aiCodingAssistant');
        await config.update('provider', settings.provider, vscode.ConfigurationTarget.Global);
        await config.update('model', settings.model, vscode.ConfigurationTarget.Global);
        if (settings.apiKey) {
            await config.update('apiKey', settings.apiKey, vscode.ConfigurationTarget.Global);
        }
    }
}
