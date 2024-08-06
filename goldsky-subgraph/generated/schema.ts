// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal,
} from "@graphprotocol/graph-ts";

export class Option extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Option entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Option must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Option", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Option | null {
    return changetype<Option | null>(store.get_in_block("Option", id));
  }

  static load(id: string): Option | null {
    return changetype<Option | null>(store.get("Option", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get writer(): string {
    let value = this.get("writer");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set writer(value: string) {
    this.set("writer", Value.fromString(value));
  }

  get isCall(): boolean {
    let value = this.get("isCall");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set isCall(value: boolean) {
    this.set("isCall", Value.fromBoolean(value));
  }

  get premium(): BigInt {
    let value = this.get("premium");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set premium(value: BigInt) {
    this.set("premium", Value.fromBigInt(value));
  }

  get strikePrice(): BigInt {
    let value = this.get("strikePrice");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set strikePrice(value: BigInt) {
    this.set("strikePrice", Value.fromBigInt(value));
  }

  get expirationDate(): BigInt {
    let value = this.get("expirationDate");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set expirationDate(value: BigInt) {
    this.set("expirationDate", Value.fromBigInt(value));
  }

  get deadlineDate(): BigInt {
    let value = this.get("deadlineDate");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set deadlineDate(value: BigInt) {
    this.set("deadlineDate", Value.fromBigInt(value));
  }

  get shares(): BigInt {
    let value = this.get("shares");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set shares(value: BigInt) {
    this.set("shares", Value.fromBigInt(value));
  }

  get sharesLeft(): BigInt | null {
    let value = this.get("sharesLeft");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set sharesLeft(value: BigInt | null) {
    if (!value) {
      this.unset("sharesLeft");
    } else {
      this.set("sharesLeft", Value.fromBigInt(<BigInt>value));
    }
  }

  get capPerUnit(): BigInt {
    let value = this.get("capPerUnit");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set capPerUnit(value: BigInt) {
    this.set("capPerUnit", Value.fromBigInt(value));
  }

  get hasToPay(): boolean {
    let value = this.get("hasToPay");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set hasToPay(value: boolean) {
    this.set("hasToPay", Value.fromBoolean(value));
  }

  get countervalue(): BigInt {
    let value = this.get("countervalue");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set countervalue(value: BigInt) {
    this.set("countervalue", Value.fromBigInt(value));
  }

  get premiumCollected(): BigInt | null {
    let value = this.get("premiumCollected");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set premiumCollected(value: BigInt | null) {
    if (!value) {
      this.unset("premiumCollected");
    } else {
      this.set("premiumCollected", Value.fromBigInt(<BigInt>value));
    }
  }

  get responseValue(): BigInt | null {
    let value = this.get("responseValue");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set responseValue(value: BigInt | null) {
    if (!value) {
      this.unset("responseValue");
    } else {
      this.set("responseValue", Value.fromBigInt(<BigInt>value));
    }
  }

  get users(): UserLoader {
    return new UserLoader("Option", this.get("id")!.toString(), "users");
  }

  get isDeleted(): boolean {
    let value = this.get("isDeleted");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set isDeleted(value: boolean) {
    this.set("isDeleted", Value.fromBoolean(value));
  }

  get name(): string | null {
    let value = this.get("name");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set name(value: string | null) {
    if (!value) {
      this.unset("name");
    } else {
      this.set("name", Value.fromString(<string>value));
    }
  }
}

export class User extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save User entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type User must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("User", id.toString(), this);
    }
  }

  static loadInBlock(id: string): User | null {
    return changetype<User | null>(store.get_in_block("User", id));
  }

  static load(id: string): User | null {
    return changetype<User | null>(store.get("User", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get options(): Array<string> | null {
    let value = this.get("options");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set options(value: Array<string> | null) {
    if (!value) {
      this.unset("options");
    } else {
      this.set("options", Value.fromStringArray(<Array<string>>value));
    }
  }

  get optionUnitsMapping(): OptionUnitsMappingLoader {
    return new OptionUnitsMappingLoader(
      "User",
      this.get("id")!.toString(),
      "optionUnitsMapping",
    );
  }
}

export class OptionUnitsMapping extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save OptionUnitsMapping entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type OptionUnitsMapping must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("OptionUnitsMapping", id.toString(), this);
    }
  }

  static loadInBlock(id: string): OptionUnitsMapping | null {
    return changetype<OptionUnitsMapping | null>(
      store.get_in_block("OptionUnitsMapping", id),
    );
  }

  static load(id: string): OptionUnitsMapping | null {
    return changetype<OptionUnitsMapping | null>(
      store.get("OptionUnitsMapping", id),
    );
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get user(): string {
    let value = this.get("user");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set user(value: string) {
    this.set("user", Value.fromString(value));
  }

  get option(): string {
    let value = this.get("option");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set option(value: string) {
    this.set("option", Value.fromString(value));
  }

  get units(): BigInt {
    let value = this.get("units");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set units(value: BigInt) {
    this.set("units", Value.fromBigInt(value));
  }

  get claimed(): boolean {
    let value = this.get("claimed");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set claimed(value: boolean) {
    this.set("claimed", Value.fromBoolean(value));
  }

  get errorClaim(): boolean {
    let value = this.get("errorClaim");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set errorClaim(value: boolean) {
    this.set("errorClaim", Value.fromBoolean(value));
  }
}

export class UserLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): User[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<User[]>(value);
  }
}

export class OptionUnitsMappingLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): OptionUnitsMapping[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<OptionUnitsMapping[]>(value);
  }
}
