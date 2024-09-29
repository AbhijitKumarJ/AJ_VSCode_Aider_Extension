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
                                                                                                                                
     context.subscriptions.push(                                                                                                
         vscode.commands.registerCommand("aider.runCommand", async (command: string, options: any) => {    
            console.log(options);                     
             return new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {                                      
                 const terminal = vscode.window.createTerminal('Aider Terminal');                                               
                 terminal.sendText(command);                                                                                    
                 terminal.show();                                                                                               
                                                                                                                                
                 // Listen for terminal output                                                                                  
                 const disposable = vscode.window.onDidCloseTerminal((closedTerminal) => {                                      
                     if (closedTerminal === terminal) {                                                                         
                         disposable.dispose();                                                                                  
                         resolve({ stdout: '', stderr: '' });                                                                   
                     }                                                                                                          
                 });                                                                                                            
                                                                                                                                
                 // Handle errors                                                                                               
                 terminal.processId.then((pid) => {                                                                             
                     if (!pid) {                                                                                                
                         reject(new Error('Failed to start terminal process'));                                                 
                     }                                                                                                          
                 });                                                                                                            
             });                                                                                                                
         })                                                                                                                     
     );                                                                                                                         
                                                                                                                                
     console.log('AI Coding Assistant extension activated');                                                                    
 }                                                                                                                              
                                                                                                                                
 export function deactivate() {                                                                                                 
     console.log('AI Coding Assistant extension deactivated');                                                                  
 }                                                                                                                              
                     