import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Token} from "./token.model"
import {Owner} from "./owner.model"

@Entity_()
export class Transfer {
    constructor(props?: Partial<Transfer>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Token, {nullable: true})
    token!: Token

    @Index_()
    @ManyToOne_(() => Owner, {nullable: true})
    from!: Owner | undefined | null

    @Index_()
    @ManyToOne_(() => Owner, {nullable: true})
    to!: Owner | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    price!: bigint

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint

    @Index_()
    @Column_("int4", {nullable: false})
    block!: number

    @Index_()
    @Column_("text", {nullable: false})
    transactionHash!: string
}
