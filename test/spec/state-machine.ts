/**
 * Created by gjrwcs on 3/28/2017.
 */

import { only, skip, slow, suite, test, timeout } from 'mocha-typescript';
import { expect } from 'chai';
import { state, StateMachine} from '../../src/state-machine';

class TestState extends StateMachine {
    @state public static State1;
    @state public static State2;
    @state public static State3;
    @state public static State4;
}

@suite class StateMachineSpec {

    private testState: TestState;

    before() {
        this.testState = new TestState();
    }

    @test 'Registers all derived class properties as states'() {
        expect(TestState.State1).to.equal(1);
        expect(TestState.State2).to.equal(2);
        expect(TestState.State3).to.equal(4);
        expect(TestState.State4).to.equal(8);
    }

    @test 'Returns the current state'() {
        expect(this.testState.getState()).to.equal(0);
    }

    @test 'Sets the current state'() {
        this.testState.setState(TestState.State1);
        expect(this.testState.getState()).to.equal(TestState.State1);
    }

    @test 'Tests against the current state'() {
        expect(this.testState.is(TestState.State1)).to.be.false;

        this.testState.setState(TestState.State2);

        expect(this.testState.is(TestState.State1)).to.be.false;
        expect(this.testState.is(TestState.State2)).to.be.true;
        expect(this.testState.is(TestState.State3)).to.be.false;
        expect(this.testState.is(TestState.State4)).to.be.false;
    }

    @test 'Adds to the current state'() {
        this.testState.setState(TestState.State2);
        this.testState.addState(TestState.State3);

        expect(this.testState.is(TestState.State2)).to.be.true;
        expect(this.testState.is(TestState.State3)).to.be.true;
    }

    @test 'Removes from the current state'() {
        this.testState.setState(TestState.State2);
        this.testState.addState(TestState.State3);
        this.testState.removeState(TestState.State2);

        expect(this.testState.is(TestState.State2)).to.be.false;
        expect(this.testState.is(TestState.State3)).to.be.true;
    }
}
