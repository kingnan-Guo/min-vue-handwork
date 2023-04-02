describe("effect", () => {
    it.skip('first path', () => {
        const user = reactive({
            age: 10,
        })
        let nextAge;
        // 依赖收集 fn
        effect(() => {
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)

        // upDate
        user.age++
        expect(nextAge).toBe(12)
    })
})