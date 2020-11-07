import React, { useState, useReducer, useEffect, useCallback } from "react";
import IngredientList from "./IngredientList";
import IngredientForm from "./IngredientForm";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

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

const httpReducer = (currHttpState, action) => {
	switch (action.type) {
		case "SEND":
			return { loading: true, error: null };
		case "RESPONSE":
			return { ...currHttpState, loading: false };
		case "ERROR":
			return { loading: false, error: action.errorMessage };
		case "CLEAR":
			return { ...currHttpState, error: null };
		default:
			throw new Error("Should not be reached!");
	}
};

const Ingredients = () => {
	const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
	const [httpState, dispatchHttp] = useReducer(httpReducer, {
		loading: false,
		error: null,
	});
	// const [userIngredients, setUserIngredients] = useState([]);
	// const [isLoading, setIsLoading] = useState(false);
	// const [error, setError] = useState();

	useEffect(() => {
		console.log("RENDERING INGREDIENTS", userIngredients);
	}, [userIngredients]);

	const filteredIngredientsHandler = useCallback((filteredIngredients) => {
		// setUserIngredients(filteredIngredients);
		dispatch({ type: "SET", ingredients: filteredIngredients });
	}, []);

	const addIngredientHandler = (ingredient) => {
		dispatchHttp({ type: "SEND" });
		fetch(
			"https://react-hooks-update-4b02e.firebaseio.com/ingredients.json",
			{
				method: "POST",
				body: JSON.stringify(ingredient),
				headers: { "Content-Type": "application/json" },
			}
		)
			.then((response) => {
				dispatchHttp({ type: "RESPONSE" });
				return response.json();
			})
			.then((data) => {
				console.log("data", data);
				// setUserIngredients((prevIngredients) => [
				// 	...prevIngredients,
				// 	{ id: data.name, ...ingredient },
				// ]);
				dispatch({
					type: "ADD",
					ingredient: { id: data.name, ...ingredient },
				});
			});
	};

	const removeIngredientHandler = (ingredientId) => {
		dispatchHttp({ type: "SEND" });
		fetch(
			`https://react-hooks-update-4b02e.firebaseio.com/ingredients/${ingredientId}.json`,
			{
				method: "DELETE",
			}
		)
			.then((response) => {
				dispatchHttp({ type: "RESPONSE" });
				// setUserIngredients((prevIngredients) =>
				// 	prevIngredients.filter(
				// 		(ingredient) => ingredient.id !== ingredientId
				// 	)
				// );
				dispatch({ type: "DELETE", id: ingredientId });
			})
			.catch((error) => {
				dispatchHttp({
					type: "ERROR",
					errorMessage: "Something went wrong",
				});
			});
	};

	const clearError = () => {
		dispatchHttp({ type: "CLEAR" });
	};

	return (
		<div className="App">
			{httpState.error && (
				<ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
			)}
			<IngredientForm
				onAddIngredint={addIngredientHandler}
				isLoading={httpState.loading}
			/>

			<section>
				<Search onLoadIngredients={filteredIngredientsHandler} />
				<IngredientList
					ingredients={userIngredients}
					onRemoveItem={removeIngredientHandler}
				/>
			</section>
		</div>
	);
};

export default Ingredients;
