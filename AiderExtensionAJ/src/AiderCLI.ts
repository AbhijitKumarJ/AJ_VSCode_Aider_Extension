import * as cp from 'child_process';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const exec = util.promisify(cp.exec);

export class AiderCLI {
    private historyFile: string;

    constructor(
        private workspacePath: string,
        private provider: string,
        private model: string,
        private apiKeyName: string,
        private apiKeyValue: string
    ) {
        this.historyFile = path.join(this.workspacePath, '.aider_history');
    }

    async runAiderCommand(prompt: string, mode: 'edit' | 'chat' = 'edit'): Promise<string> {
        try {
            const sanitizedPrompt = this.sanitizeInput(prompt);
            const modeFlag = mode === 'chat' ? '--chat' : '';
            const providerFlag = this.provider === 'anthropic' ? '--use-anthropic' : '';
            const command = `python -m aider ${providerFlag} --model ${this.model} ${modeFlag} "${sanitizedPrompt}"`;
            
            const env = { ...process.env };
            if (os.platform() === 'win32') {
                process.env[this.apiKeyName] = this.apiKeyValue;
                //process.env['ANTHROPIC_API_KEY'] = env['ANTHROPIC_API_KEY'];
            } else {
                env[this.apiKeyName] = this.apiKeyValue;
                //env['ANTHROPIC_API_KEY'] = process.env['ANTHROPIC_API_KEY'];
            }

            const { stdout, stderr } = await exec(command, { cwd: this.workspacePath, env });

            const result = stdout || stderr;
            await this.appendToHistory(sanitizedPrompt);

            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Aider command execution failed: ${error.message}`);
            } else {
                throw new Error(`Aider command execution failed with an unknown error.`);
            }
        }
    }

    private sanitizeInput(input: string): string {
        // Remove any characters that could be used for command injection
        return input.replace(/[;&|`$()]/g, '');
    }

    private async appendToHistory(prompt: string): Promise<void> {
        try {
            await fs.promises.appendFile(this.historyFile, prompt + '\n');
        } catch (error) {
            console.error('Failed to append to history:', error);
        }
    }

    async getHistory(): Promise<string[]> {
        try {
            const history = await fs.promises.readFile(this.historyFile, 'utf-8');
            return history.split('\n').filter(line => line.trim() !== '');
        } catch (error: any) {
            if (error && error.code === 'ENOENT') {
                return [];
            } else {
                throw error;
            }
        }    
    }

    async clearHistory(): Promise<void> {
        try {
            await fs.promises.writeFile(this.historyFile, '');
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to clear history: ${error.message}`);
            } else {
                throw new Error('Failed to clear history with an unknown error.');
            }
        }
    }
}