import {Entity} from "./Entity";
import {ServerClass} from "./ServerClass";
import {SendTable} from "./SendTable";
import {StringTable} from "./StringTable";
import {SendProp} from "./SendProp";
import {GameEventDefinitionMap} from "./GameEvent";
import {BitStream} from "bit-buffer";
import {UserInfo} from "./UserInfo";
import {World} from "./World";
import {Player} from "./Player";
import {Death} from "./Death";
import {handleStringTable} from "../PacketHandler/StringTable";
import {handleSayText2} from "../PacketHandler/SayText2";
import {handleGameEvent} from "../PacketHandler/GameEvent";
import {handlePacketEntities} from "../PacketHandler/PacketEntities";

export class Match {
	tick: number;
	chat: any[];
	users: UserInfo[];
	deaths: Death[];
	rounds: any[];
	startTick: number;
	intervalPerTick: number;
	entities: (Entity|null)[];
	stringTables: StringTable[];
	serverClasses: ServerClass[];
	sendTables: SendTable[];
	instanceBaselines: SendProp[][][];
	staticBaseLines: BitStream[];
	eventDefinitions: GameEventDefinitionMap;
	world: World;
	players: Player[];
	playerMap: {[entityId: number]: Player};

	constructor() {
		this.tick              = 0;
		this.chat              = [];
		this.users             = [];
		this.deaths            = [];
		this.rounds            = [];
		this.startTick         = 0;
		this.intervalPerTick   = 0;
		this.entities          = [];
		this.stringTables      = [];
		this.sendTables        = [];
		this.serverClasses     = [];
		this.entities          = [];
		this.instanceBaselines = [[], []];
		this.staticBaseLines   = [];
		this.eventDefinitions  = {};
		this.players           = [];
		this.playerMap         = {};
		this.world             = {
			boundaryMin: {x: 0, y: 0, z: 0},
			boundaryMax: {x: 0, y: 0, z: 0}
		}
	}

	getSendTable(name) {
		for (const table of this.sendTables) {
			if (table.name === name) {
				return table;
			}
		}
		throw new Error("unknown SendTable " + name);
	}

	getStringTable(name) {
		for (const table of this.stringTables) {
			if (table.name === name) {
				return table;
			}
		}
		return null;
	}

	getState() {
		return {
			'chat':            this.chat,
			'users':           this.users,
			'deaths':          this.deaths,
			'rounds':          this.rounds,
			'startTick':       this.startTick,
			'intervalPerTick': this.intervalPerTick
		};
	}

	handlePacket(packet) {
		switch (packet.packetType) {
			case 'packetEntities':
				handlePacketEntities(packet, this);
				break;
			case 'netTick':
				if (this.startTick === 0) {
					this.startTick = packet.tick;
				}
				this.tick = packet.tick;
				break;
			case 'serverInfo':
				this.intervalPerTick = packet.intervalPerTick;
				break;
			case 'sayText2':
				handleSayText2(packet, this);
				break;
			case 'stringTable':
				handleStringTable(packet, this);
				break;
			case 'gameEvent':
				handleGameEvent(packet, this);
				break;
		}
	}

	getUserInfo(userId: number): UserInfo {
		// no clue why it does this
		// only seems to be the case with per user ready
		while (userId > 256) {
			userId -= 256;
		}
		if (!this.users[userId]) {
			this.users[userId] = {
				name:     '',
				userId:   userId,
				steamId:  '',
				classes:  {},
				entityId: 0,
				team:     ''
			}
		}
		return this.users[userId];
	}

	getUserInfoForEntity(entity: Entity): UserInfo {
		for (const user of this.users) {
			if (user && user.entityId === entity.entityIndex) {
				return user;
			}
		}
		throw new Error('User not found for entity ' + entity.entityIndex);
	}

	getPlayerByUserId(userId: number): Player {
		for (const player of this.players) {
			if (player.user.userId === userId) {
				return player;
			}
		}
		throw new Error('player not found for user id');
	}

	get classBits() {
		return Math.ceil(Math.log(this.serverClasses.length) * Math.LOG2E)
	}
}