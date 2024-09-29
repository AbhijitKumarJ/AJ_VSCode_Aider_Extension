import * as vscode from 'vscode';                                                                                              
                                                                                                                                
 interface CommandResult {                                                                                                      
     stdout: string;                                                                                                            
     stderr: string;                                                                                                            
 }                                                                                                                              
                                                                                                                                
 export class AiderCLI {                                                                                                        
     private historyFile: vscode.Uri;                                                                                           
                                                                                                                                
     constructor(                                                                                                               
         private workspacePath: string,                                                                                         
         private provider: string,                                                                                              
         private model: string,                                                                                                 
         private apiKeyName: string,                                                                                            
         private apiKeyValue: string                                                                                            
     ) {                                                                                                                        
         this.historyFile = vscode.Uri.file(this.workspacePath + '/.aider_history');                                            
     }                                                                                                                          
                                                                                                                                
     async runAiderCommand(prompt: string, mode: 'edit' | 'chat' = 'edit'): Promise<string> {                                   
         try {                                                                                                                  
             const sanitizedPrompt = this.sanitizeInput(prompt);                                                                
             const modeFlag = mode === 'chat' ? '--chat-mode' : '';                                                                  
             const providerFlag = this.provider === 'anthropic' ? '--use-anthropic' : '';                                       
             const command = `python -m aider ${providerFlag} --model ${this.model} ${modeFlag} "${sanitizedPrompt}"`;          
                                                                                                                                
             const env = { ...process.env };                                                                                    
             env[this.apiKeyName] = this.apiKeyValue;                                                                           
                                                                                                                                
             const result = await vscode.commands.executeCommand<CommandResult>('aider.runCommand', command, { env });          
                                                                                                                                
             const output = result.stdout || result.stderr;                                                                     
             await this.appendToHistory(sanitizedPrompt);                                                                       
                                                                                                                                
             return output;                                                                                                     
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
             const document = await vscode.workspace.openTextDocument(this.historyFile);                                        
             const edit = new vscode.WorkspaceEdit();                                                                           
             edit.insert(this.historyFile, new vscode.Position(document.lineCount, 0), prompt + '\n');                          
             await vscode.workspace.applyEdit(edit);                                                                            
         } catch (error) {                                                                                                      
             console.error('Failed to append to history:', error);                                                              
         }                                                                                                                      
     }                                                                                                                          
                                                                                                                                
     async getHistory(): Promise<string[]> {                                                                                    
         try {                                                                                                                  
             const document = await vscode.workspace.openTextDocument(this.historyFile);                                        
             return document.getText().split('\n').filter(line => line.trim() !== '');                                          
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
             const edit = new vscode.WorkspaceEdit();                                                                           
             edit.delete(this.historyFile, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)));             
             await vscode.workspace.applyEdit(edit);                                                                            
         } catch (error) {                                                                                                      
             if (error instanceof Error) {                                                                                      
                 throw new Error(`Failed to clear history: ${error.message}`);                                                  
             } else {                                                                                                           
                 throw new Error('Failed to clear history with an unknown error.');                                             
             }                                                                                                                  
         }                                                                                                                      
     }                                                                                                                          
 }       