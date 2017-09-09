import {BitStream} from 'bit-buffer';
import {assertEncoder, assertParser, getStream} from './PacketTest';
import {Match} from '../../../../Data/Match';
import {hydrateEntity, hydrateTable} from './hydrate';
import {ServerClass} from '../../../../Data/ServerClass';
import {PacketEntitiesPacket} from '../../../../Data/Packet';
import {readFileSync} from 'fs';
import {gunzipSync} from 'zlib';
import {EncodePacketEntities, ParsePacketEntities} from '../../../../Parser/Packet/PacketEntities';
import * as assert from 'assert';

const data = JSON.parse(readFileSync(__dirname + '/../../../data/packetEntitiesData.json', 'utf8'));
const packetData = JSON.parse(gunzipSync(readFileSync(__dirname + '/../../../data/packetEntitiesResult.json.gz')).toString('utf8'));
const sendTableData = JSON.parse(gunzipSync(readFileSync(__dirname + '/../../../data/packetEntitiesSendTables.json.gz')).toString('utf8'));
const serverClassesData = JSON.parse(readFileSync(__dirname + '/../../../data/packetEntitiesServerClasses.json', 'utf8'));

const expected: PacketEntitiesPacket = {
	packetType: 'packetEntities',
	removedEntities: packetData.removedEntities,
	updatedBaseLine: packetData.updatedBaseLine,
	baseLine: packetData.baseLine,
	delta: packetData.delta,
	maxEntries: packetData.maxEntries,
	entities: packetData.entities.map(hydrateEntity)
};

const match = new Match();
match.serverClasses.length = 348;
for (const serverClass of serverClassesData) {
	match.serverClasses[serverClass.id] = new ServerClass(serverClass.id, serverClass.name, serverClass.dataTable);
}
for (const sendTable of sendTableData) {
	const table = hydrateTable(sendTable);
	match.sendTables.set(table.name, table);
}

for (const entity of expected.entities) {
	match.entityClasses.set(entity.entityIndex, entity.serverClass);
}

function parse(stream: BitStream) {
	return ParsePacketEntities(stream, match);
}

function encode(value: PacketEntitiesPacket, stream: BitStream) {
	EncodePacketEntities(value, stream, match);
}

const sunEntityData = {
	'serverClass': {
		'id': 123,
		'name': 'CSun',
		'dataTable': 'DT_Sun'
	},
	'entityIndex': 403,
	'props': [
		{
			'definition': {
				'type': 0,
				'name': 'm_clrRender',
				'flags': 1,
				'excludeDTName': null,
				'lowValue': 0,
				'highValue': 0,
				'bitCount': 32,
				'table': null,
				'numElements': 0,
				'arrayProperty': null,
				'ownerTableName': 'DT_Sun'
			},
			'value': 4276271871
		},
		{
			'definition': {
				'type': 0,
				'name': 'm_clrOverlay',
				'flags': 1,
				'excludeDTName': null,
				'lowValue': 0,
				'highValue': 0,
				'bitCount': 32,
				'table': null,
				'numElements': 0,
				'arrayProperty': null,
				'ownerTableName': 'DT_Sun'
			},
			'value': 0
		},
		{
			'definition': {
				'type': 2,
				'name': 'm_vDirection',
				'flags': 32,
				'excludeDTName': null,
				'lowValue': 0,
				'highValue': -121121.125,
				'bitCount': 0,
				'table': null,
				'numElements': 0,
				'arrayProperty': null,
				'ownerTableName': 'DT_Sun'
			},
			'value': {
				'x': -0.6453346360527601,
				'y': -0.504152418172936,
				'z': 0.1880801172447484
			}
		}
	],
	'inPVS': true,
	'pvs': 1,
	'serialNumber': 664
};

suite('PacketEntities', () => {
	test('Parse packetEntities', () => {
		const length = 130435;
		const stream = getStream(data);
		const start = stream.index;
		const resultPacket = parse(stream);
		assert.equal(stream.index - start, length, 'Unexpected number of bits consumed from stream');

		for (let i = 0; i < resultPacket.entities.length; i++) {
			const resultEntity = resultPacket.entities[i];
			const expectedEntity = expected.entities[i];
			assert.deepEqual(resultEntity, expectedEntity);
		}
	});

	// test('Encode packetEntities', () => {
	// 	assertEncoder(parse, encode, expected, Math.ceil(data.length / 8));
	// });
	//
	// test('Encode small packetEntities', () => {
	// 	assertEncoder(parse, encode, {
	// 		packetType: 'packetEntities',
	// 		removedEntities: [10, 11],
	// 		updatedBaseLine: false,
	// 		baseLine: 0,
	// 		delta: 0,
	// 		maxEntries: 16,
	// 		entities: [hydrateEntity(sunEntityData)]
	// 	}, 259);
	// });
});