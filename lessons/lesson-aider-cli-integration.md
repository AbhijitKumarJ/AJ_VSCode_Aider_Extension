# Lesson: Integrating Aider CLI Tool with VSCode Extension

## Table of Contents
1. [Introduction](#introduction)
2. [Setting Up the Extension](#setting-up-the-extension)
3. [Aider CLI Integration](#aider-cli-integration)
4. [User Interface for Aider Interaction](#user-interface-for-aider-interaction)
5. [Handling Aider Output](#handling-aider-output)
6. [Implementing File Changes](#implementing-file-changes)
7. [Error Handling and Fallback Mechanisms](#error-handling-and-fallback-mechanisms)
8. [Extending Aider's Capabilities](#extending-aiders-capabilities)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)
11. [Conclusion](#conclusion)
12. [Exercises](#exercises)

## Introduction

In this lesson, we'll create a VSCode extension that integrates the Aider CLI tool. Aider is an AI-powered coding assistant that uses OpenAI's GPT models to help with coding tasks. Our extension will allow users to interact with Aider directly from VSCode, providing an seamless AI-assisted coding experience.

## Setting Up the Extension

First, let's set up the basic structure of our extension:

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { AiderIntegration } from './aider-integration';

export function activate(context: vscode.ExtensionContext) {
    const aiderIntegration = new AiderIntegration(context);

    let disposable = vscode.commands.registerCommand('extension.runAider', () => {
        aiderIntegration.run();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
```

## Aider CLI Integration

Now, let's create a module to interact with the Aider CLI:

```typescript
// src/aider-cli.ts
import * as cp from 'child_process';
import * as util from 'util';

const exec = util.promisify(cp.exec);

export class AiderCLI {
    constructor(private workspacePath: string) {}

    async runAiderCommand(prompt: string): Promise<string> {
        try {
            const command = `aider "${prompt}"`;
            const { stdout, stderr } = await exec(command, { cwd: this.workspacePath });
            return stdout || stderr;
        } catch (error) {
            throw new Error(`Aider command execution failed: ${error.message}`);
        }
    }
}
```

## User Interface for Aider Interaction

Let's create a user interface for interacting with Aider:

```typescript
// src/aider-integration.ts
import * as vscode from 'vscode';
import { AiderCLI } from './aider-cli';

export class AiderIntegration {
    private aiderCLI: AiderCLI;

    constructor(private context: vscode.ExtensionContext) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            this.aiderCLI = new AiderCLI(workspaceFolders[0].uri.fsPath);
        } else {
            throw new Error('No workspace folder open');
        }
    }

    async run() {
        const prompt = await vscode.window.showInputBox({
            prompt: 'Enter your coding task or question for Aider'
        });

        if (!prompt) return;

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running Aider",
            cancellable: false
        }, async (progress) => {
            try {
                const result = await this.aiderCLI.runAiderCommand(prompt);
                this.displayAiderResult(result);
            } catch (error) {
                vscode.window.showErrorMessage(`Aider error: ${error.message}`);
            }
        });
    }

    private displayAiderResult(result: string) {
        const resultPanel = vscode.window.createWebviewPanel(
            'aiderResult',
            'Aider Result',
            vscode.ViewColumn.Two,
            {}
        );

        resultPanel.webview.html = this.getWebviewContent(result);
    }

    private getWebviewContent(result: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Aider Result</title>
            </head>
            <body>
                <pre>${result}</pre>
            </body>
            </html>
        `;
    }
}
```

## Handling Aider Output

Aider's output often includes suggested code changes. Let's parse and handle these suggestions:

```typescript
// src/aider-integration.ts
import * as vscode from 'vscode';
import { AiderCLI } from './aider-cli';

export class AiderIntegration {
    // ... previous methods ...

    private async handleAiderSuggestions(result: string) {
        const fileChanges = this.parseFileChanges(result);

        for (const [filePath, changes] of Object.entries(fileChanges)) {
            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            const edit = new vscode.WorkspaceEdit();

            changes.forEach(change => {
                edit.replace(uri, new vscode.Range(
                    document.positionAt(change.start),
                    document.positionAt(change.end)
                ), change.newText);
            });

            const applyChanges = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Apply changes to ${filePath}?`
            });

            if (applyChanges === 'Yes') {
                await vscode.workspace.applyEdit(edit);
            }
        }
    }

    private parseFileChanges(result: string): Record<string, Array<{start: number, end: number, newText: string}>> {
        // This is a simplified parser. In a real-world scenario, you'd need a more robust parser
        // to handle Aider's output format accurately.
        const fileChanges: Record<string, Array<{start: number, end: number, newText: string}>> = {};

        const fileChangeRegex = /--- (.+)\n\+\+\+ \1\n@@ -(\d+),(\d+) \+(\d+),(\d+) @@\n([\s\S]+?)(?=\n--- |\n$)/g;
        let match;

        while ((match = fileChangeRegex.exec(result)) !== null) {
            const [_, filePath, startLine, _, endLine, _, changesText] = match;
            const changes = changesText.split('\n')
                .filter(line => line.startsWith('+') || line.startsWith('-'))
                .map(line => line.slice(1));

            if (!fileChanges[filePath]) {
                fileChanges[filePath] = [];
            }

            fileChanges[filePath].push({
                start: parseInt(startLine) - 1,
                end: parseInt(endLine),
                newText: changes.join('\n')
            });
        }

        return fileChanges;
    }
}
```

## Implementing File Changes

Now, let's update our `run` method to handle the file changes:

```typescript
// src/aider-integration.ts
export class AiderIntegration {
    // ... previous methods ...

    async run() {
        const prompt = await vscode.window.showInputBox({
            prompt: 'Enter your coding task or question for Aider'
        });

        if (!prompt) return;

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running Aider",
            cancellable: false
        }, async (progress) => {
            try {
                const result = await this.aiderCLI.runAiderCommand(prompt);
                this.displayAiderResult(result);
                await this.handleAiderSuggestions(result);
            } catch (error) {
                vscode.window.showErrorMessage(`Aider error: ${error.message}`);
            }
        });
    }
}
```

## Error Handling and Fallback Mechanisms

Let's implement more robust error handling:

```typescript
// src/aider-integration.ts
export class AiderIntegration {
    // ... previous methods ...

    private async handleError(error: Error) {
        const errorMessage = `An error occurred: ${error.message}`;
        vscode.window.showErrorMessage(errorMessage);

        const shouldRetry = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Would you like to try again with a different prompt?'
        });

        if (shouldRetry === 'Yes') {
            await this.run();
        }
    }

    async run() {
        // ... previous implementation ...

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running Aider",
            cancellable: false
        }, async (progress) => {
            try {
                const result = await this.aiderCLI.runAiderCommand(prompt);
                this.displayAiderResult(result);
                await this.handleAiderSuggestions(result);
            } catch (error) {
                await this.handleError(error);
            }
        });
    }
}
```

## Extending Aider's Capabilities

Let's add support for Aider's different modes of operation:

```typescript
// src/aider-cli.ts
export class AiderCLI {
    // ... previous methods ...

    async runAiderCommand(prompt: string, mode: 'edit' | 'chat' = 'edit'): Promise<string> {
        try {
            const modeFlag = mode === 'chat' ? '--chat' : '';
            const command = `aider ${modeFlag} "${prompt}"`;
            const { stdout, stderr } = await exec(command, { cwd: this.workspacePath });
            return stdout || stderr;
        } catch (error) {
            throw new Error(`Aider command execution failed: ${error.message}`);
        }
    }
}

// Update aider-integration.ts to use the new mode
export class AiderIntegration {
    // ... previous methods ...

    async run() {
        const mode = await vscode.window.showQuickPick(['Edit', 'Chat'], {
            placeHolder: 'Choose Aider mode'
        });

        if (!mode) return;

        const prompt = await vscode.window.showInputBox({
            prompt: `Enter your ${mode.toLowerCase()} prompt for Aider`
        });

        if (!prompt) return;

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running Aider",
            cancellable: false
        }, async (progress) => {
            try {
                const result = await this.aiderCLI.runAiderCommand(prompt, mode.toLowerCase() as 'edit' | 'chat');
                this.displayAiderResult(result);
                if (mode === 'Edit') {
                    await this.handleAiderSuggestions(result);
                }
            } catch (error) {
                await this.handleError(error);
            }
        });
    }
}
```

## Security Considerations

Implement security measures to prevent unauthorized command execution:

```typescript
// src/aider-cli.ts
export class AiderCLI {
    // ... previous methods ...

    private sanitizeInput(input: string): string {
        // Remove any characters that could be used for command injection
        return input.replace(/[;&|`$()]/g, '');
    }

    async runAiderCommand(prompt: string, mode: 'edit' | 'chat' = 'edit'): Promise<string> {
        const sanitizedPrompt = this.sanitizeInput(prompt);
        // ... rest of the method using sanitizedPrompt
    }
}
```

## Performance Optimization

Optimize the extension for better performance:

```typescript
// src/aider-integration.ts
export class AiderIntegration {
    private resultCache: Map<string, string> = new Map();

    // ... other methods ...

    async run() {
        // ... previous implementation ...

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running Aider",
            cancellable: false
        }, async (progress) => {
            try {
                const cacheKey = `${mode}|${prompt}`;
                let result: string;

                if (this.resultCache.has(cacheKey)) {
                    result = this.resultCache.get(cacheKey)!;
                } else {
                    result = await this.aiderCLI.runAiderCommand(prompt, mode.toLowerCase() as 'edit' | 'chat');
                    this.resultCache.set(cacheKey, result);
                }

                this.displayAiderResult(result);
                if (mode === 'Edit') {
                    await this.handleAiderSuggestions(result);
                }
            } catch (error) {
                await this.handleError(error);
            }
        });
    }
}
```

## Conclusion

Integrating the Aider CLI tool with a VSCode extension provides a powerful way to bring AI-assisted coding directly into the editor. This integration allows developers to leverage Aider's capabilities seamlessly within their workflow, enhancing productivity and code quality.

## Exercises

1. Implement a feature that allows users to review and selectively apply Aider's suggested changes.
2. Create a custom output channel in VSCode to display Aider's results instead of using a webview.
3. Add support for Aider's other command-line options, such as specifying the model to use or setting the temperature.
4. Implement a feature that allows users to save and reuse common Aider prompts.
5. Create a tree view that displays the history of Aider interactions and allows users to quickly rerun previous prompts.

By completing these exercises, you'll gain practical experience in integrating CLI tools with VSCode extensions, handling command output, and creating user-friendly interfaces for AI-assisted coding tools.

