export class BoardData {
   view: any;
   help_key?: number|string ;
   title?:string;
   constructor(view: any, title?: string, help_key?: number|string,) {
      this.view = view;
      this.title = title;
      this.help_key = help_key;
   }
}