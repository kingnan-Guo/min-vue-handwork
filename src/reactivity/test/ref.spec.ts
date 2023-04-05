import { effect } from "../effect";
import { ref, isRef, unRef, proxyRefs} from "../ref";
import { reactive } from "../reactive";
describe("ref", () => {
  it('ref path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    // expect(a.data).toBe(2)
  })


  it("should be reactive", () => {
      const a = ref(1);
      let dummy;
      let calls = 0;
      effect(() => {
        calls++;
        dummy = a.value;
      });
      expect(calls).toBe(1);
      expect(dummy).toBe(1);
      a.value = 2;
      // a.value = 2;
      expect(calls).toBe(2);
      expect(dummy).toBe(2);
      // same value should not trigger
      a.value = 2;
      expect(calls).toBe(2);
      expect(dummy).toBe(2);
    });
  
    it("should make nested properties reactive", () => {
      const a = ref({
        count: 1,
      });
      let dummy;
      effect(() => {
        dummy = a.value.count;
      });
      expect(dummy).toBe(1);
      a.value.count = 2;
      expect(dummy).toBe(2);
    });
  


  // 判断是否为 ref 类型
    it("isRef", () => {
      const a = ref(1);
      const user = reactive({
        age: 1,
      });
      expect(isRef(a)).toBe(true);
      expect(isRef(1)).toBe(false);
      expect(isRef(user)).toBe(false);
    });
  

    // 返回 ref.value 的值
    it("unRef", () => {
      const a = ref(1);
      expect(unRef(a)).toBe(1);
      expect(unRef(1)).toBe(1);
    });



    // -------------------
    // 使用场景 vue3
    // template 中使用 ref.value
    // setUp {return {ref} }

    // 功能分析
    // get ->age(ref) 那么就返回 .value
    // not ref  返回ref值
    it("proxyRefs", () => {
      const user = {
        age: ref(10),
        name: "xiaohong",
      };
      const proxyUser = proxyRefs(user);
      expect(user.age.value).toBe(10);
      expect(proxyUser.age).toBe(10);
      expect(proxyUser.name).toBe("xiaohong");
  
      (proxyUser as any).age = 20;
      expect(proxyUser.age).toBe(20);
      expect(user.age.value).toBe(20);
  
      proxyUser.age = ref(10);
      expect(proxyUser.age).toBe(10);
      expect(user.age.value).toBe(10);
    });
  





})