import {BitStream} from 'bit-buffer';
import {EncodeVoiceData, ParseVoiceData} from '../../../../Parser/Packet/VoiceData';
import {assertEncoder, assertParser, assertReEncode, getStream} from './PacketTest';

const data = [5, 18, 24, 0, 123, 219, 1];

suite('VoiceData', () => {
	test('Parse voiceData', () => {
		assertParser(ParseVoiceData, getStream(data), {
			packetType: 'voiceData',
			client: '5',
			proximity: 18,
			length: 24,
			data: getStream([123, 219, 1])
		}, 56);
	});

	test('Encode voiceData', () => {
		assertEncoder(ParseVoiceData, EncodeVoiceData, {
			packetType: 'voiceData',
			client: '5',
			proximity: 18,
			length: 24,
			data: getStream([123, 219, 1])
		}, 56);
	});

	test('Re-encode voiceData', () => {
		assertReEncode(ParseVoiceData, EncodeVoiceData, getStream(data));
	});
});
