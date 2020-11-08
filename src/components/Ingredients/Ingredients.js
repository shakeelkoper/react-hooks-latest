import React, {
	useState,
	useReducer,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import IngredientList from "./IngredientList";
import IngredientForm from "./IngredientForm";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";
import useHttp from "../../hooks/http";

const ingredientReducer = (currentIngredients, action) => {
	switch (action.type) {
		case "SET":
			return action.ingredients;
		case "ADD":
			return [...currentIngredients, action.ingredient];
		case "DELETE":
			return currentIngredients.filter((ing) => ing.id !== action.id);
		default:
			throw new Error("Should not get there");
	}
};

const Ingredients = () => {
	const {
		isLoading,
		error,
		data,
		sendRequest,
		reqExtra,
		reqIdentifier,
		clear,
	} = useHttp();
	const [userIngredients, dispatch] = useReducer(ingredientReducer, []);

	useEffect(() => {
		if (!isLoading && !error && reqIdentifier === "REMOVE_INGREDIENT") {
			dispatch({ type: "DELETE", id: reqExtra });
		} else if (!isLoading && !error && reqIdentifier === "ADD_INGREDIENT") {
			dispatch({
				type: "ADD",
				ingredient: { id: data.name, ...reqExtra },
			});
		}
	}, [data, reqExtra, isLoading, error]);

	const filteredIngredientsHandler = useCallback((filteredIngredients) => {
		// setUserIngredients(filteredIngredients);
		dispatch({ type: "SET", ingredients: filteredIngredients });
	}, []);

	const addIngredientHandler = useCallback(
		(ingredient) => {
			sendRequest(
				"https://react-hooks-update-4b02e.firebaseio.com/ingredients.json",
				"POST",
				JSON.stringify(ingredient),
				ingredient,
				"ADD_INGREDIENT"
			);
		},
		[sendRequest]
	);

	const removeIngredientHandler = useCallback(
		(ingredientId) => {
			sendRequest(
				`https://react-hooks-update-4b02e.firebaseio.com/ingredients/${ingredientId}.json`,
				"DELETE",
				null,
				ingredientId,
				"REMOVE_INGREDIENT"
			);
		},
		[sendRequest]
	);

	const ingredientList = useMemo(() => {
		return (
			<IngredientList
				ingredients={userIngredients}
				onRemoveItem={removeIngredientHandler}
			/>
		);
	}, [userIngredients, removeIngredientHandler]);

	return (
		<div className="App">
			{error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
			<IngredientForm
				onAddIngredint={addIngredientHandler}
				isLoading={isLoading}
			/>

			<section>
				<Search onLoadIngredients={filteredIngredientsHandler} />
				{ingredientList}
			</section>
		</div>
	);
};

export default Ingredients;
