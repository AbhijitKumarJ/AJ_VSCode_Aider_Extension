import * as vscode from 'vscode';                                                                                              
 import { AiderCLI } from './AiderCLI';                                                                                         
 import { handleFileChanges } from './utils/fileOperations';                                                                    
                                                                                                                                
 export class AiderIntegration {                                                                                                
     private aiderCLI: AiderCLI;                                                                                                
                                                                                                                                
     constructor(private _context: vscode.ExtensionContext) {     
        console.log(this._context);                                                              
         const workspaceFolders = vscode.workspace.workspaceFolders;                                                            
         if (workspaceFolders) {                                                                                                
             const config = vscode.workspace.getConfiguration('aiCodingAssistant');                                             
             const provider = config.get<string>('provider', 'gemini');                                                         
             const model = config.get<string>('model', 'gemini/gemini-1.5-flash');                                              
             const apiKeyName = config.get<string>('apiKeyName', 'GEMINI_API_KEY');                                             
             const apiKeyValue = config.get<string>('apiKeyValue', '');                                                         
                                                                                                                                
             this.aiderCLI = new AiderCLI(workspaceFolders[0].uri.fsPath, provider, model, apiKeyName, apiKeyValue);            
         } else {                                                                                                               
             throw new Error('No workspace folder open');                                                                       
         }                                                                                                                    
     }                                                                                                                          
                                                                                                                                
     async runAiderCommand(prompt: string, mode: 'edit' | 'chat' = 'edit'): Promise<string> {                                   
         try {                                                                                                                  
             const result = await this.aiderCLI.runAiderCommand(prompt, mode);                                                  
                                                                                                                                
             if (mode === 'edit') {                                                                                             
                 await handleFileChanges(result);                                                                               
             }                                                                                                                  
                                                                                                                                
             return result;                                                                                                     
         } catch (error) {                                                                                                      
             if (error instanceof Error) {                                                                                      
                 vscode.window.showErrorMessage(`Aider error: ${error.message}`);                                               
                 return `Error: ${error.message}`;                                                                              
             } else {                                                                                                           
                 vscode.window.showErrorMessage(`Aider encountered an unknown error.`);                                         
                 return `Error: An unknown error occurred.`;                                                                    
             }                                                                                                                  
         }                                                                                                                      
     }                                                                                                                          
                                                                                                                                
     async getAiderHistory(): Promise<string[]> {                                                                               
         try {                                                                                                                  
             return await this.aiderCLI.getHistory();                                                                           
         } catch (error) {                                                                                                      
             if (error instanceof Error) {                                                                                      
                 vscode.window.showErrorMessage(`Failed to get Aider history: ${error.message}`);                               
             } else {                                                                                                           
                 vscode.window.showErrorMessage(`Failed to get Aider history due to an unknown error.`);                        
             }                                                                                                                  
             return [];                                                                                                         
         }                                                                                                                      
     }                                                                                                                          
                                                                                                                                
     async clearAiderHistory(): Promise<void> {                                                                                 
         try {                                                                                                                  
             await this.aiderCLI.clearHistory();                                                                                
             vscode.window.showInformationMessage('Aider history cleared successfully');                                        
         } catch (error) {                                                                                                      
             if (error instanceof Error) {                                                                                      
                 vscode.window.showErrorMessage(`Failed to clear Aider history: ${error.message}`);                             
             } else {                                                                                                           
                 vscode.window.showErrorMessage(`Failed to clear Aider history due to an unknown error.`);                      
             }                                                                                                                  
         }                                                                                                                      
     }                                                                                                                          
 }               