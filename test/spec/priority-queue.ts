'use strict';
/**
 * Created by gjrwcs on 2/23/2017.
 */

import { only, skip, slow, suite, test, timeout } from "mocha-typescript";
import { expect } from "chai";
import { PriorityQueue } from "../../src/priority-queue";

@suite class PriorityQueueSpec {

    priorityQueue: PriorityQueue;

    before() {
        this.priorityQueue = new PriorityQueue();
    }

    @test 'Can instantiate a PriorityQueue'() {
        const priorityQueue = new PriorityQueue();
        expect(priorityQueue).to.be.instanceOf(PriorityQueue);
    }

    @test 'Enqueue and Dequeue items from a queue instance'() {
        this.priorityQueue.enqueue(0, 'item1');
        expect(this.priorityQueue.dequeue()).to.equal('item1');
    }

    @test 'Items with lowest priority dequeue first'() {
        this.priorityQueue.enqueue(0, 'item1');
        this.priorityQueue.enqueue(2, 'item2');
        this.priorityQueue.enqueue(1, 'item3');

        expect(this.priorityQueue.dequeue()).to.equal('item1');
        expect(this.priorityQueue.dequeue()).to.equal('item3');
        expect(this.priorityQueue.dequeue()).to.equal('item2');
    }

    @test 'new items with duplicate priority are dequeue after existing items'() {
        this.priorityQueue.enqueue(0, 'item1');
        this.priorityQueue.enqueue(0, 'item2');

        expect(this.priorityQueue.dequeue()).to.equal('item1');
        expect(this.priorityQueue.dequeue()).to.equal('item2');
    }

    @test 'Dequeue empty queue returns null'() {
        expect(this.priorityQueue.dequeue()).to.equal(null);
    }

    @test 'peek returns the next item to be dequeued'() {
        this.priorityQueue.enqueue(0, 'item1');
        expect(this.priorityQueue.peek()).to.equal('item1');
    }

    @test 'clear removes all items from the queue'() {
        this.priorityQueue.enqueue(0, 'item1');
        this.priorityQueue.enqueue(1, 'item2');
        expect(this.priorityQueue.peek()).to.equal('item1');
        this.priorityQueue.clear();
        expect(this.priorityQueue.peek()).to.equal(null);
    }

    @test 'getIterator returns an iterator for the queue'() {
        expect(this.priorityQueue.getIterator()).respondsTo('next').and.respondsTo('isEnd');
    }

    @test 'asArray returns an ordered array of all items in the Queue'() {
        this.priorityQueue.enqueue(0, 'item1');
        this.priorityQueue.enqueue(2, 'item2');
        this.priorityQueue.enqueue(1, 'item3');

        expect(this.priorityQueue.asArray()).to.deep.equal(['item1', 'item3', 'item2']);
    }
}
