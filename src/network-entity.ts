'use strict';
/**
 * Created by gjr8050 on 2/23/2017.
 */

export interface INetworkEntity {
    /**
     * Returns a serializable copy of the data on an entity
     */
    getSerializable(): Object;
}
