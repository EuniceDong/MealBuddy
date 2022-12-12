// AUTHOR: HARSHIT GAJJAR
import { PieChart } from "react-minimal-pie-chart";
import "./css/calorie-tracker.css";
import "../../Reused.css";
import Logo from "../header/logo";
import { useEffect, useState } from "react";
import { pieColors, cssClass } from "../../utils/util";
import NotLoggedIn from "../NoLogIn/NotLoggedIn";
import Spinner from "../Spinner/Spinner";

function CalorieTracker() {
  const [categories, setCategories] = useState([]);
  const [tData, setData] = useState({});
  const [pieData, setPieData] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let obj = {};

    async function fetch_data() {
      try {
        const user_name = await fetch("/api/account/getUser");
        const user = await user_name.json();
        setUser(user);

        if ("user" in user) {
          const allOrders = await fetch(
            "/api/calorie/getAllOrders/" + user.user
          );
          const orderJson = await allOrders.json();

          orderJson.data[0].orders.forEach((elem) => {
            elem.cart.forEach((c) => {
              if (c.category in obj) {
                obj = {
                  ...obj,
                  [c.category]: {
                    ...[c.category],
                    count: obj[c.category].count + c.qty,
                    calories: obj[c.category].calories + c.calories * c.qty,
                  },
                };
              } else {
                obj = {
                  ...obj,
                  [c.category]: {
                    count: c.qty,
                    calories: c.calories * c.qty,
                  },
                };
              }
            });
          });

          let arr = Object.keys(obj);

          let pieDataArr = [];
          let totalCalories = 0;

          arr.forEach((e, index) => {
            totalCalories += obj[e].calories;
            pieDataArr.push({
              title: e,
              value: obj[e].calories,
              color: pieColors[index],
              cssClassName: cssClass[index],
            });
          });

          pieDataArr = pieDataArr.map((p) => {
            return {
              ...p,
              value: Math.round((p.value / totalCalories) * 100),
            };
          });

          console.log(pieDataArr);
          setPieData(pieDataArr);
          setCategories(arr);
          setData(obj);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    }

    fetch_data();
  }, []);

  function calorieTrackerUI() {
    return (
      <main>
        <div className="pie_chart_container">
          <h1>Calorie Tracker</h1>
          <div>
            <div className="pie_chart">
              <PieChart
                // label={(props) => {
                //   return (
                //     props.dataEntry.title + "-" + props.dataEntry.value + "%"
                //   );
                // }}
                data={pieData}
                // labelStyle={() => {
                //   return { fontSize: "5px", fill: "white" };
                // }}
              />
              <div className="key_codes">
                {pieData.length > 0
                  ? pieData.map((e) => {
                      return (
                        <div className="calorie_key">
                          <div className={`key_circle ${e.cssClassName}`}></div>
                          <p className="calorie_item_name">{e.title}</p>
                        </div>
                      );
                    })
                  : ""}
              </div>
            </div>
          </div>
        </div>
        <div className="calorie_table">
          <table>
            <tbody className="calorie_table_body">
              <tr>
                <th className="table_header">Item</th>
                <th className="table_header">Quantity</th>
                <th className="table_header">Total Calories</th>
              </tr>
              {categories.map((t, index) => {
                return (
                  <tr key={index}>
                    <td className="calorie_row">{t}</td>
                    <td className="calorie_row">{tData[t].count}</td>
                    <td className="calorie_row">
                      {tData[t].calories} calories
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    );
  }

  return (
    <div className="content_block">
      <header>
        <Logo />
      </header>
      {"user" in user ? (
        loading ? (
          <Spinner />
        ) : (
          calorieTrackerUI()
        )
      ) : (
        <main>
          <NotLoggedIn />
        </main>
      )}
    </div>
  );
}

CalorieTracker.propTypes = {};

export default CalorieTracker;
