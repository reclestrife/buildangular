function sayHello(n) {
    return _.template("Hello <%=name%>")({name: n});
}