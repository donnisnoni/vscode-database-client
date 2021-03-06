import * as path from "path";
import { Constants, ModelType } from "../../common/constants";
import { DatabaseCache } from "../../service/common/databaseCache";
import { QueryUnit } from "../../service/queryUnit";
import { Node } from "../interface/node";
import { InfoNode } from "../other/infoNode";
import { TableNode } from "./tableNode";

export class TableGroup extends Node {

    public iconPath: string = path.join(Constants.RES_PATH, "icon/table.svg");
    public contextValue: string = ModelType.TABLE_GROUP;
    constructor(readonly parent: Node) {
        super("TABLE")
        this.uid = `${parent.getConnectId()}_${parent.database}_${ModelType.TABLE_GROUP}`;
        this.init(parent)
    }

    public async getChildren(isRresh: boolean = false): Promise<Node[]> {

        let tableNodes = DatabaseCache.getChildListOfId(this.uid);
        if (tableNodes && !isRresh) {
            return tableNodes;
        }
        return this.execute<any[]>( this.dialect.showTables(this.database))
            .then((tables) => {
                tableNodes = tables.map<TableNode>((table) => {
                    return new TableNode(table.name, table.comment, this);
                });
                if (tableNodes.length == 0) {
                    tableNodes = [new InfoNode("This database has no table")];
                }
                DatabaseCache.setTableListOfDatabase(this.uid, tableNodes);
                return tableNodes;
            })
            .catch((err) => {
                return [new InfoNode(err)];
            });
    }

    public async createTemplate() {

        QueryUnit.showSQLTextDocument(this, this.dialect.tableTemplate(), 'create-table-template.sql')

    }
}
