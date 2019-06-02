/**
 * Start all the needed services for each camera
 */

import RtmpStream from './RtmpStream';
import ThumbMaker from './ThumbMaker';


enum Services {
  rtmpStream,
  thumbMaker,
}

type ServiceItem = [RtmpStream, ThumbMaker];


export default class Cameras {
  private readonly services: {[index: string]: ServiceItem} = {};



}
