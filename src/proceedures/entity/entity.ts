import marked from "marked";
import * as fs from "fs";
import path from "path";


export class BuferedText{
    protected buf : string
    constructor(text? : string) {
        this.buf = text ? text : "";
    }

    public set(text : string) {
        this.buf = text;
    }

    public get () : string {
        return this.buf;
    }

    public async write (filePath : string) {
        return new Promise<void> ((resolve, reject) => {
            fs.writeFile(filePath, this.buf, (error => {
                error ? reject(error) : resolve();
            }));
        })
    }

    private async fromFile(filePath : string, ext? : string) {
        throw new Error("Not Implemented")
    }
}

export class MarkDownText extends BuferedText{
    constructor(markDown? : string) {
        super(markDown)
    }

    async parseHTML() {
        return new Promise<string>((resolve, reject) => {
            marked.parse(this.buf, (error,result) => {
                error ? reject(error) : resolve(result);
            })
        })
    }

}

export class HTMLText extends BuferedText{
    constructor(html? : string) {
        super(html)
    }
}

export class RawText extends BuferedText{
    constructor(raw? : string) {
        super(raw)
    }

    parseHTML() : HTMLText {
        const paragraphize = "<p>" + super.buf.replace(/\n　/g,"</p><p>")
        const lineBrakeText = paragraphize.replace(/\n/g, "</ br>")
        return new HTMLText(lineBrakeText);
    }

}

class ProjectConfig {
    private name : string;
    private dataDir : string;

    constructor() {
        this.name = "";
        this.dataDir = "";
    }

    setProject(name : string){
        this.name = name;
        this.dataDir = "data"
    }

    getProjectName(){
        return this.name
    }
    getProjectDir(){
        return this.dataDir
    }
}

export class ProjectConfigProvider {
    static config : ProjectConfig | undefined
    static getConfig () {
        if(!this.config) {
            this.config = new ProjectConfig();
        }
        return this.config;
    }
}
