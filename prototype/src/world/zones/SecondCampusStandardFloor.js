import { WardFloorplan } from '../shared/WardFloorplan.js';

export class SecondCampusStandardFloor extends WardFloorplan {
  constructor(scene,geometryFactory,{floor=5}={}){super(scene,geometryFactory,{campus:'second',floor});}
}
