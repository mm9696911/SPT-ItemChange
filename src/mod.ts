import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod"
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables"
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem"


class Mod implements IPostAkiLoadMod, IPostDBLoadMod {
    database: DatabaseServer
    logger: ILogger
    tables: IDatabaseTables
    items: Record<string, ITemplateItem>

    private modConfig = require("../config/config.json");

    private init(container: DependencyContainer) {
        this.database = container.resolve<DatabaseServer>("DatabaseServer")

        this.logger.info("Database data is loaded, working...")
        this.tables = this.database.getTables()
        this.items = this.tables.templates.items
    }

    public postDBLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger")
        this.init(container);

        for (const bullet of this.modConfig.Bullets) {

            const item = this.tables.templates.items[bullet.itemId];
            this.logger.info(`${bullet.desc} default Damage: ${item._props.Damage}`);

            item._props.Damage = bullet.damage;
        }


        for (const container of this.modConfig.Containers) {

            const item = this.tables.templates.items[container.itemId];
            const itemGridProps = item._props.Grids[0]
            if (container.cellsH != undefined && container.cellsV != undefined) {
                this.logger.info(`${container.desc} default Grid: ${itemGridProps._props.cellsH} x ${itemGridProps._props.cellsV}`);

                itemGridProps._props.cellsH = container.cellsH;
                itemGridProps._props.cellsV = container.cellsV;
            }

            if (container.Weight != undefined) {
                this.logger.info(`${container.desc} default Weight: ${item._props.Weight}`);
                item._props.Weight = container.Weight;
            }
        }
    }

    public postAkiLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger")
        this.init(container);

        for (const bullet of this.modConfig.Bullets) {
            const item = this.tables.templates.items[bullet.itemId];
            this.logger.info(`${bullet.desc} modified Damage: ${item._props.Damage}`);
        }

        for (const container of this.modConfig.Containers) {

            const item = this.tables.templates.items[container.itemId];
            const itemGridProps = item._props.Grids[0]
            if (container.cellsH != undefined && container.cellsV != undefined) {
                this.logger.info(`${container.desc} modified Grid: ${itemGridProps._props.cellsH} x ${itemGridProps._props.cellsV}`);
            }

            if (container.Weight != undefined) {
                this.logger.info(`${container.desc} modified Weight: ${item._props.Weight}`);
            }
        }
    }
}

module.exports = { mod: new Mod() }