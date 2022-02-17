import React, { createContext, useReducer, Dispatch } from 'react';

import { IRestaurant } from '../lib/restaurants';

interface IState {
  latLong: string;
  restaurants: IRestaurant[];
}

export enum EActionTypes {
  SET_LAT_LONG = 'SET_LAT_LONG',
  SET_RESTAURANTS = 'SET_RESTAURANTS',
}

type TActions =
  | {
    type: EActionTypes.SET_LAT_LONG;
    payload: {
      latLong: string;
    };
  }
  | {
    type: EActionTypes.SET_RESTAURANTS;
    payload: {
      restaurants: IRestaurant[];
    };
  };

const initialState = {
  latLong: '',
  restaurants: [],
};

export const StoreContext = createContext<{
  state: IState;
  dispatch: Dispatch<TActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

const storeReducer = (state: IState, action: TActions) => {
  switch (action.type) {
    case EActionTypes.SET_LAT_LONG: {
      return {
        ...state,
        latLong: action.payload.latLong,
      };
    }

    case EActionTypes.SET_RESTAURANTS: {
      return {
        ...state,
        restaurants: action.payload.restaurants,
      };
    }

    default:
      return state;
    // throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const StoreProvider = ({ children, }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
