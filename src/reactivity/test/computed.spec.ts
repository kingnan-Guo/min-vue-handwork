import { reactive } from "../reactive";
import { computed } from "../computed";
describe("computed-reactive", () => {
    // computed 类似于 ref ,.value 获取数据
    // 有缓存功能


    it("computed", () => {
        const value = reactive({
          foo: 1,
        });
    
        const getter = computed(() => {
          return value.foo;
        });
    
        // value.foo = 1;
        expect(getter.value).toBe(1);
      });
    
      it("should compute lazily", () => {
        const value = reactive({
          foo: 1,
        });
        const getter = jest.fn(() => {
          return value.foo;
        });
        const cValue = computed(getter);
    
        // lazy 懒执行 如果没有调用cValue.value  那么函数都不会去执行
        expect(getter).not.toHaveBeenCalled();
        
        expect(cValue.value).toBe(1);
        // 当调用  cValue.value  后 getter 才算被调用一次
        expect(getter).toHaveBeenCalledTimes(1);
    
        // // should not compute again
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(1);
    
        // // should not compute until needed
        value.foo = 2; //会出发 trigger -> effect(收集都需要 effect) 
        // 因为 effect 的ReactiveEffect 收集 fn 后，再修改值会自动触发 fn，
        expect(getter).toHaveBeenCalledTimes(1);
    
        // // now it should compute
        // 
        expect(cValue.value).toBe(2);
        expect(getter).toHaveBeenCalledTimes(2);
    
        // // should not compute again
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(2);
      });




});