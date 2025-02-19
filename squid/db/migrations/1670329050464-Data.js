module.exports = class Data1670329050464 {
    name = 'Data1670329050464'

    async up(db) {
        await db.query(`CREATE TABLE "owner" ("id" character varying NOT NULL, CONSTRAINT "PK_8e86b6b9f94aece7d12d465dc0c" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "transfer" ("id" character varying NOT NULL, "price" numeric NOT NULL, "timestamp" numeric NOT NULL, "block" integer NOT NULL, "transaction_hash" text NOT NULL, "token_id" character varying, "from_id" character varying, "to_id" character varying, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_b27b1150b8a7af68424540613c" ON "transfer" ("token_id") `)
        await db.query(`CREATE INDEX "IDX_76bdfed1a7eb27c6d8ecbb7349" ON "transfer" ("from_id") `)
        await db.query(`CREATE INDEX "IDX_0751309c66e97eac9ef1149362" ON "transfer" ("to_id") `)
        await db.query(`CREATE INDEX "IDX_70ff8b624c3118ac3a4862d22c" ON "transfer" ("timestamp") `)
        await db.query(`CREATE INDEX "IDX_c116ab40c3b32ca2d9c1d17d8b" ON "transfer" ("block") `)
        await db.query(`CREATE INDEX "IDX_e8a057744db5ad984bbea97444" ON "transfer" ("transaction_hash") `)
        await db.query(`CREATE TABLE "contract" ("id" character varying NOT NULL, "name" text NOT NULL, "symbol" text NOT NULL, "contract_uri" text, "address" text, "contract_uri_updated" numeric, "total_supply" numeric NOT NULL, CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_973644690f8ec06af4eebfd3a8" ON "contract" ("name") `)
        await db.query(`CREATE INDEX "IDX_ae5c59dd42750a76aba50d9504" ON "contract" ("symbol") `)
        await db.query(`CREATE INDEX "IDX_04af51488ba2943b3f9ace5be9" ON "contract" ("contract_uri_updated") `)
        await db.query(`CREATE TABLE "token" ("id" character varying NOT NULL, "uri" text, "name" text, "description" text, "image_uri" text, "price" numeric NOT NULL, "for_sale" boolean, "owner_id" character varying, "contract_id" character varying, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_77fa31a311c711698a0b944382" ON "token" ("owner_id") `)
        await db.query(`CREATE INDEX "IDX_5c85dbbd108d915a13f71de39a" ON "token" ("contract_id") `)
        await db.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_b27b1150b8a7af68424540613c7" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_76bdfed1a7eb27c6d8ecbb73496" FOREIGN KEY ("from_id") REFERENCES "owner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_0751309c66e97eac9ef11493623" FOREIGN KEY ("to_id") REFERENCES "owner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_77fa31a311c711698a0b9443823" FOREIGN KEY ("owner_id") REFERENCES "owner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_5c85dbbd108d915a13f71de39ad" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "owner"`)
        await db.query(`DROP TABLE "transfer"`)
        await db.query(`DROP INDEX "public"."IDX_b27b1150b8a7af68424540613c"`)
        await db.query(`DROP INDEX "public"."IDX_76bdfed1a7eb27c6d8ecbb7349"`)
        await db.query(`DROP INDEX "public"."IDX_0751309c66e97eac9ef1149362"`)
        await db.query(`DROP INDEX "public"."IDX_70ff8b624c3118ac3a4862d22c"`)
        await db.query(`DROP INDEX "public"."IDX_c116ab40c3b32ca2d9c1d17d8b"`)
        await db.query(`DROP INDEX "public"."IDX_e8a057744db5ad984bbea97444"`)
        await db.query(`DROP TABLE "contract"`)
        await db.query(`DROP INDEX "public"."IDX_973644690f8ec06af4eebfd3a8"`)
        await db.query(`DROP INDEX "public"."IDX_ae5c59dd42750a76aba50d9504"`)
        await db.query(`DROP INDEX "public"."IDX_04af51488ba2943b3f9ace5be9"`)
        await db.query(`DROP TABLE "token"`)
        await db.query(`DROP INDEX "public"."IDX_77fa31a311c711698a0b944382"`)
        await db.query(`DROP INDEX "public"."IDX_5c85dbbd108d915a13f71de39a"`)
        await db.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_b27b1150b8a7af68424540613c7"`)
        await db.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_76bdfed1a7eb27c6d8ecbb73496"`)
        await db.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_0751309c66e97eac9ef11493623"`)
        await db.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_77fa31a311c711698a0b9443823"`)
        await db.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_5c85dbbd108d915a13f71de39ad"`)
    }
}
