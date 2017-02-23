'use strict';
/**
 * Created by gjrwcs on 2/23/2017.
 */

import { only, skip, slow, suite, test, timeout } from "mocha-typescript";
import {PriorityQueue} from "../../src/priority-queue";

@suite class PriorityQueueSpec {

    @test 'Can instantiate a PriorityQueue'() {
        const priorityQueue = new PriorityQueue();
    }
}
