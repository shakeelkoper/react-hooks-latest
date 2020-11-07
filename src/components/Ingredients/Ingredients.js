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

const Ingredients = () => {
	const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
	// const [userIngredients, setUserIngredients] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();

	useEffect(() => {
		console.log("RENDERING INGREDIENTS", userIngredients);
	}, [userIngredients]);

	const filteredIngredientsHandler = useCallback((filteredIngredients) => {
		// setUserIngredients(filteredIngredients);
		dispatch({ type: "SET", ingredients: filteredIngredients });
	}, []);

	const addIngredientHandler = (ingredient) => {
		setIsLoading(true);
		fetch(
			"https://react-hooks-update-4b02e.firebaseio.com/ingredients.json",
			{
				method: "POST",
				body: JSON.stringify(ingredient),
				headers: { "Content-Type": "application/json" },
			}
		)
			.then((response) => {
				setIsLoading(false);
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
		setIsLoading(true);
		fetch(
			`https://react-hooks-update-4b02e.firebaseio.com/ingredients/${ingredientId}.json`,
			{
				method: "DELETE",
			}
		)
			.then((response) => {
				setIsLoading(false);
				// setUserIngredients((prevIngredients) =>
				// 	prevIngredients.filter(
				// 		(ingredient) => ingredient.id !== ingredientId
				// 	)
				// );
				dispatch({ type: "DELETE", id: ingredientId });
			})
			.catch((error) => {
				setError("Something went wrong!");
			});
	};

	const clearError = () => {
		setError(null);
		setIsLoading(false);
	};

	return (
		<div className="App">
			{error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
			<IngredientForm
				onAddIngredint={addIngredientHandler}
				isLoading={isLoading}
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
