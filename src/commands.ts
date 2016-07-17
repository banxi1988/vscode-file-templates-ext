import vscode = require('vscode');
import fs = require('fs');
import path = require('path');
import TemplatesManager from './templatesManager';
import helpers = require('./helpers');

/**
 * Main command to create a file from a template.
 * This command can be invoked by the Command Palette or in a folder context menu on the explorer view.
 * @export
 * @param {TemplatesManager} templatesManager
 * @param {*} args Whem this command is executed via explorer context menu, this method will receive a list of args, including
 * the path for the selected folder. This value will be undefined if the extension is toggled from the Command Palette
 * @returns
 */
export function createFromTemplate (templatesManager: TemplatesManager, args: any) {
    
     let templates = templatesManager.getTemplates();
     
     // gets the target folder. if its invoked from a context menu, we use that reference, otherwise we use the root path
     let targetFolder = args ? args.path : vscode.workspace.rootPath;

     if (templates.length == 0) {
         let optionGoToTemplates = <vscode.MessageItem>{
                    title: "Open Templates Folder"
                };

         vscode.window.showInformationMessage("No templates found!", optionGoToTemplates).then(option => {
            
            // nothing selected
            if (!option) {
                return;
            }

            helpers.openFolderInExplorer(templatesManager.getTemplatesDir());
           
         });

        return;
     }

     // show the list of available templates.
     vscode.window.showQuickPick(templates).then(selection => {

         // nothing selected. cancel
         if (!selection) {
             return;
         }

        // ask for filename 
        let inputOptions = <vscode.InputBoxOptions>{
            prompt: "Please enter the desired filename",
            value: selection
        };

        vscode.window.showInputBox(inputOptions).then(filename => {
            let fileContents = templatesManager.getTemplate(selection) // @TODO the file has to be the selection.;
            
            fs.writeFile(path.join(targetFolder, filename), fileContents, function(err) {
                if(err) {
                  vscode.window.showErrorMessage(err.message);
                }
                vscode.window.showInformationMessage(filename + " created");
            });             
        });
     });
}
