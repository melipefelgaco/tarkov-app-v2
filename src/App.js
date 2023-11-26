import React, { useState, useEffect } from "react";
import { request, gql } from "graphql-request";
import "./App.css";

function App() {
	const [items, setItems] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	const fetchData = async () => {
		try {
			const query = gql`
				{
					items {
						id
						name
						sellFor {
							price
							currency
							priceRUB
							source
						}
						inspectImageLink
						usedInTasks {
							id
							name
							minPlayerLevel
						}
						wikiLink
					}
				}
			`;

			const data = await request("https://api.tarkov.dev/graphql", query);

			setItems(data.items);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleSearch = () => {
		const searchTermLowerCase = searchTerm.toLowerCase();
		const filteredItems = items.filter((item) =>
			item.name.toLowerCase().includes(searchTermLowerCase)
		);
		setItems(filteredItems);
	};

	const handleKeyPress = (event) => {
		if (event.key === "Enter") {
			console.log(event.key);
			handleSearch();
		}
	};

	const findTopTwoSellPrices = (sellFor) => {
		if (sellFor && sellFor.length > 0) {
			const sortedPrices = sellFor.sort((a, b) => b.priceRUB - a.priceRUB);
			const topTwoPrices = sortedPrices.slice(0, 2);

			return topTwoPrices;
		}
		return [];
	};

	return (
		<div className="app-container">
			<div className="search-container">
				<input
					type="text"
					placeholder="Search for an item"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					onKeyDown={handleKeyPress}
				/>
				<button onClick={handleSearch}>Search</button>
			</div>
			<h1 className="app-title">TARKOV ITEMS</h1>
			<ul className="item-list">
				{items.map((item) => (
					<div key={item.id} className="item-card">
						<h3>{item.name.toUpperCase()}</h3>
						<div className="item-details">
							<a href={item.wikiLink} target="_blank" rel="noopener noreferrer">
								<img src={item.inspectImageLink} alt={item.name} className="item-image" />
							</a>
							{item.sellFor && item.sellFor.length > 0 && (
								<ul className="price-list">
									{findTopTwoSellPrices(item.sellFor).map((price, index) => (
										<li
											key={`${item.id}-sell-${index}`}
											style={{
												fontWeight:
													price.priceRUB ===
													Math.max(...findTopTwoSellPrices(item.sellFor).map((p) => p.priceRUB))
														? "bold"
														: "normal",
											}}>
											{price.priceRUB} RUB - {price.source.toUpperCase()}
										</li>
									))}
								</ul>
							)}
						</div>
						<ul className="task-list">
							{item.usedInTasks.map((task) => (
								<li key={`${item.id}-task-${task.id}`}>
									Task: {task.name.toUpperCase()}, Min Player Level: {task.minPlayerLevel}
								</li>
							))}
						</ul>
					</div>
				))}
			</ul>
		</div>
	);
}

export default App;
