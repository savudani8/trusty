/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractTransaction, EventFilter, Signer } from "ethers";
import { Listener, Provider } from "ethers/providers";
import { Arrayish, BigNumber, BigNumberish, Interface } from "ethers/utils";
import {
  TransactionOverrides,
  TypedEventDescription,
  TypedFunctionDescription
} from ".";

interface LTCRInterface extends Interface {
  functions: {
    curate: TypedFunctionDescription<{ encode([]: []): string }>;

    getAgentCollateral: TypedFunctionDescription<{
      encode([agent]: [string]): string;
    }>;

    getAgentFactor: TypedFunctionDescription<{
      encode([agent]: [string]): string;
    }>;

    getAssignment: TypedFunctionDescription<{
      encode([agent]: [string]): string;
    }>;

    getBounds: TypedFunctionDescription<{
      encode([layer]: [BigNumberish]): string;
    }>;

    getFactor: TypedFunctionDescription<{
      encode([layer]: [BigNumberish]): string;
    }>;

    getLayers: TypedFunctionDescription<{ encode([]: []): string }>;

    getReward: TypedFunctionDescription<{
      encode([action]: [BigNumberish]): string;
    }>;

    getScore: TypedFunctionDescription<{ encode([agent]: [string]): string }>;

    initialize: TypedFunctionDescription<{
      encode([sender]: [string]): string;
    }>;

    isOwner: TypedFunctionDescription<{ encode([]: []): string }>;

    owner: TypedFunctionDescription<{ encode([]: []): string }>;

    registerAgent: TypedFunctionDescription<{
      encode([agent, collateral]: [string, BigNumberish]): string;
    }>;

    renounceOwnership: TypedFunctionDescription<{ encode([]: []): string }>;

    setBounds: TypedFunctionDescription<{
      encode([layer, lower, upper]: [
        BigNumberish,
        BigNumberish,
        BigNumberish
      ]): string;
    }>;

    setCollateral: TypedFunctionDescription<{
      encode([mincollateral]: [BigNumberish]): string;
    }>;

    setFactor: TypedFunctionDescription<{
      encode([layer, factor]: [BigNumberish, BigNumberish]): string;
    }>;

    setLayers: TypedFunctionDescription<{
      encode([layers]: [BigNumberish[]]): string;
    }>;

    setReward: TypedFunctionDescription<{
      encode([action, reward]: [BigNumberish, BigNumberish]): string;
    }>;

    transferOwnership: TypedFunctionDescription<{
      encode([newOwner]: [string]): string;
    }>;

    update: TypedFunctionDescription<{
      encode([agent, action]: [string, BigNumberish]): string;
    }>;
  };

  events: {
    Curate: TypedEventDescription<{
      encodeTopics([round, start, end]: [null, null, null]): string[];
    }>;

    NewBound: TypedEventDescription<{
      encodeTopics([lower, upper]: [null, null]): string[];
    }>;

    OwnershipTransferred: TypedEventDescription<{
      encodeTopics([previousOwner, newOwner]: [
        string | null,
        string | null
      ]): string[];
    }>;

    RegisterAgent: TypedEventDescription<{
      encodeTopics([agent, collateral]: [null, null]): string[];
    }>;

    Update: TypedEventDescription<{
      encodeTopics([agent, reward, score]: [null, null, null]): string[];
    }>;
  };
}

export class LTCR extends Contract {
  connect(signerOrProvider: Signer | Provider | string): LTCR;
  attach(addressOrName: string): LTCR;
  deployed(): Promise<LTCR>;

  on(event: EventFilter | string, listener: Listener): LTCR;
  once(event: EventFilter | string, listener: Listener): LTCR;
  addListener(eventName: EventFilter | string, listener: Listener): LTCR;
  removeAllListeners(eventName: EventFilter | string): LTCR;
  removeListener(eventName: any, listener: Listener): LTCR;

  interface: LTCRInterface;

  functions: {
    curate(overrides?: TransactionOverrides): Promise<ContractTransaction>;

    getAgentCollateral(agent: string): Promise<BigNumber>;

    getAgentFactor(agent: string): Promise<BigNumber>;

    getAssignment(agent: string): Promise<number>;

    getBounds(
      layer: BigNumberish
    ): Promise<{
      0: BigNumber;
      1: BigNumber;
    }>;

    getFactor(layer: BigNumberish): Promise<BigNumber>;

    getLayers(): Promise<number[]>;

    getReward(action: BigNumberish): Promise<BigNumber>;

    getScore(agent: string): Promise<BigNumber>;

    initialize(
      sender: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    isOwner(): Promise<boolean>;

    owner(): Promise<string>;

    registerAgent(
      agent: string,
      collateral: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    setBounds(
      layer: BigNumberish,
      lower: BigNumberish,
      upper: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    setCollateral(
      mincollateral: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    setFactor(
      layer: BigNumberish,
      factor: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    setLayers(
      layers: BigNumberish[],
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    setReward(
      action: BigNumberish,
      reward: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    update(
      agent: string,
      action: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;
  };

  curate(overrides?: TransactionOverrides): Promise<ContractTransaction>;

  getAgentCollateral(agent: string): Promise<BigNumber>;

  getAgentFactor(agent: string): Promise<BigNumber>;

  getAssignment(agent: string): Promise<number>;

  getBounds(
    layer: BigNumberish
  ): Promise<{
    0: BigNumber;
    1: BigNumber;
  }>;

  getFactor(layer: BigNumberish): Promise<BigNumber>;

  getLayers(): Promise<number[]>;

  getReward(action: BigNumberish): Promise<BigNumber>;

  getScore(agent: string): Promise<BigNumber>;

  initialize(
    sender: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  isOwner(): Promise<boolean>;

  owner(): Promise<string>;

  registerAgent(
    agent: string,
    collateral: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  setBounds(
    layer: BigNumberish,
    lower: BigNumberish,
    upper: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  setCollateral(
    mincollateral: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  setFactor(
    layer: BigNumberish,
    factor: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  setLayers(
    layers: BigNumberish[],
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  setReward(
    action: BigNumberish,
    reward: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  update(
    agent: string,
    action: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  filters: {
    Curate(round: null, start: null, end: null): EventFilter;

    NewBound(lower: null, upper: null): EventFilter;

    OwnershipTransferred(
      previousOwner: string | null,
      newOwner: string | null
    ): EventFilter;

    RegisterAgent(agent: null, collateral: null): EventFilter;

    Update(agent: null, reward: null, score: null): EventFilter;
  };

  estimate: {
    curate(): Promise<BigNumber>;

    getAgentCollateral(agent: string): Promise<BigNumber>;

    getAgentFactor(agent: string): Promise<BigNumber>;

    getAssignment(agent: string): Promise<BigNumber>;

    getBounds(layer: BigNumberish): Promise<BigNumber>;

    getFactor(layer: BigNumberish): Promise<BigNumber>;

    getLayers(): Promise<BigNumber>;

    getReward(action: BigNumberish): Promise<BigNumber>;

    getScore(agent: string): Promise<BigNumber>;

    initialize(sender: string): Promise<BigNumber>;

    isOwner(): Promise<BigNumber>;

    owner(): Promise<BigNumber>;

    registerAgent(agent: string, collateral: BigNumberish): Promise<BigNumber>;

    renounceOwnership(): Promise<BigNumber>;

    setBounds(
      layer: BigNumberish,
      lower: BigNumberish,
      upper: BigNumberish
    ): Promise<BigNumber>;

    setCollateral(mincollateral: BigNumberish): Promise<BigNumber>;

    setFactor(layer: BigNumberish, factor: BigNumberish): Promise<BigNumber>;

    setLayers(layers: BigNumberish[]): Promise<BigNumber>;

    setReward(action: BigNumberish, reward: BigNumberish): Promise<BigNumber>;

    transferOwnership(newOwner: string): Promise<BigNumber>;

    update(agent: string, action: BigNumberish): Promise<BigNumber>;
  };
}
