import React, { useState, useEffect, useRef } from "react";
import useHttp from "../../hooks/http";
import ErrorModal from "../UI/ErrorModal";
import Card from "../UI/Card";
import "./Search.css";

const Search = React.memo((props) => {
	const { onLoadIngredients } = props;
	const [eneteredFilter, setEnteredFilter] = useState("");
	const inputRef = useRef();
	const { isLoading, data, error, sendRequest, clear } = useHttp();

	useEffect(() => {
		const timer = setTimeout(() => {
			if (eneteredFilter === inputRef.current.value) {
				const query =
					eneteredFilter.length === 0
						? ""
						: `?orderBy="title"&equalTo="${eneteredFilter}"`;
				sendRequest(
					"https://react-hooks-update-4b02e.firebaseio.com/ingredients.json" +
						query,
					"GET"
				);
			}
		}, 500);
		return () => {
			clearTimeout(timer);
		};
	}, [eneteredFilter, inputRef, sendRequest]);

	useEffect(() => {
		if (!isLoading && data && !error) {
			const loadedIngredients = [];
			for (const key in data) {
				loadedIngredients.push({
					id: key,
					title: data[key].title,
					amount: data[key].amount,
				});
			}
			onLoadIngredients(loadedIngredients);
		}
	}, [data, isLoading, error, onLoadIngredients]);

	return (
		<section className="search">
			{error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
			<Card>
				<div className="search-input">
					<label>Filter by Title</label>
					{isLoading && <span>Loading...</span>}
					<input
						type="text"
						ref={inputRef}
						value={eneteredFilter}
						onChange={(event) =>
							setEnteredFilter(event.target.value)
						}
					/>
				</div>
			</Card>
		</section>
	);
});

export default Search;
