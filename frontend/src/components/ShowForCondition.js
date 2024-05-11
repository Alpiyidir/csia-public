const ShowForCondition = ({ condition, children }) => {
	if (condition) {
		return children;
	} else {
		return null;
	}
};
export default ShowForCondition;
