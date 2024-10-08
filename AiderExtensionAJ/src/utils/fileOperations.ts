import * as vscode from 'vscode';                                                                                              
                                                                                                                                
 interface FileChange {                                                                                                         
     filePath: string;                                                                                                          
     changes: Array<{                                                                                                           
         start: number;                                                                                                         
         end: number;                                                                                                           
         newText: string;                                                                                                       
     }>;                                                                                                                        
 }                                                                                                                              
                                                                                                                                
 export async function handleFileChanges(aiderOutput: string): Promise<void> {                                                  
     const fileChanges = parseFileChanges(aiderOutput);                                                                         
                                                                                                                                
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
                                                                                                                                
         // Consider showing a diff of the changes before prompting the user                                                    
         const diff = changes.map(change => {                                                                                   
             const originalText = document.getText(new vscode.Range(                                                            
                 document.positionAt(change.start),                                                                             
                 document.positionAt(change.end)                                                                                
             ));                                                                                                                
             return `Original:\n${originalText}\nNew:\n${change.newText}`;                                                      
         }).join('\n');                                                                                                         
                                                                                                                                
         const applyChanges = await vscode.window.showQuickPick(['Yes', 'No'], {                                                
             placeHolder: `Review changes to ${filePath}:\n${diff}\nApply changes?`                                             
         });                                                                                                                    
                                                                                                                                
         if (applyChanges === 'Yes') {                                                                                          
             await vscode.workspace.applyEdit(edit);                                                                            
             vscode.window.showInformationMessage(`Changes applied to ${filePath}`);                                            
         }                                                                                                                      
     }                                                                                                                          
 }                                                                                                                              
                                                                                                                                
 function parseFileChanges(output: string): Record<string, FileChange['changes']> {                                             
     const fileChanges: Record<string, FileChange['changes']> = {};                                                             
                                                                                                                                
     // Consider using a more robust parsing method or library if the output format is complex                                  
     const fileChangeRegex = /--- (.+)\n\+\+\+ \1\n@@ -(\d+),(\d+) \+(\d+),(\d+) @@\n([\s\S]+?)(?=\n--- |\n$)/g;                
     let match;                                                                                                                 
                                                                                                                                
     while ((match = fileChangeRegex.exec(output)) !== null) {                                                                  
         const [_, filePath, startLine, __, endLine, ___, changesText] = match;                                                 
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
                                                                                                                                
 export async function readFile(filePath: string): Promise<string> {                                                            
     const uri = vscode.Uri.file(filePath);                                                                                     
     const document = await vscode.workspace.openTextDocument(uri);                                                             
     return document.getText();                                                                                                 
 }                                                                                                                              
                                                                                                                                
 export async function writeFile(filePath: string, content: string): Promise<void> {                                            
     const uri = vscode.Uri.file(filePath);                                                                                     
     const edit = new vscode.WorkspaceEdit();                                                                                   
     edit.createFile(uri, { overwrite: true });                                                                                 
     edit.insert(uri, new vscode.Position(0, 0), content);                                                                      
     await vscode.workspace.applyEdit(edit);                                                                                    
 }              