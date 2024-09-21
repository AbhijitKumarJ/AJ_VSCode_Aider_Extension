import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { AiderIntegration } from './AiderIntegration';

export function activate(context: vscode.ExtensionContext) {
    console.log('Activating AI Coding Assistant extension...');

    const aiderIntegration = new AiderIntegration(context);
    const sidebarProvider = new SidebarProvider(context.extensionUri, aiderIntegration);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "aiCodingAssistantSidebar",
            sidebarProvider
        )
    );

    console.log('Webview provider registered');

    context.subscriptions.push(
        vscode.commands.registerCommand("ai-coding-assistant.openSidebar", () => {
            console.log('Open Sidebar command executed');
            vscode.commands.executeCommand("workbench.view.extension.ai-coding-assistant-sidebar-view");
        })
    );

    console.log('AI Coding Assistant extension activated');
}

export function deactivate() {
    console.log('AI Coding Assistant extension deactivated');
}